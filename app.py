from flask import Flask, render_template, jsonify, request

from flask_cors import CORS, cross_origin

from base64 import encodebytes
import glob
import io
import os
from PIL import Image
import json
import numpy as np

from scripts import converters, reconstruction



# configuration
DEBUG = True

# instantiate the app
app = Flask(__name__, static_folder="dist/static", template_folder="dist", static_url_path="/static")
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config.from_object(__name__)

# definitions
SITE = {
        'logo': 'FLASK-VUE',
        'version': '0.0.1'
}

OWNER = {
        'name': 'Wilber Wanjira',
        'website': 'https://wilber.co.ke'
}

# pass data to the frontend
site_data = {
    'site': SITE,
    'owner': OWNER
}

# landing page
@app.route('/')
def welcome():
  return render_template('index.html', **site_data)


# ping page
@app.route('/ping')
@cross_origin()
def ping():
  return jsonify("Pong !")


def get_response_image(image_path):
    pil_img = Image.open(image_path, mode='r') # reads the PIL image
    byte_arr = io.BytesIO()
    pil_img.save(byte_arr, format=pil_img.format) # convert the PIL image to byte array
    encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii') # encode as base64
    
    return {"image": f"data:image/{pil_img.format.lower()};base64, {encoded_img}",
            "format": pil_img.format.lower(),
            "height": pil_img.height,
            "width": pil_img.width
          }


# send_shortcuts page
@app.route('/shortcuts')
@cross_origin()
def shortcuts():
  cwd = os.getcwd()
  directory = f"{cwd}/data/geonemus-geoffroyii"
  with open(f"{directory}/calibration.json", "r") as f:
    calib_file = json.load(f)
  to_jsonify = {}
  to_jsonify["commands"] = []
  for command in calib_file["commands"]:
    longitude, latitude = calib_file["commands"][command]
    to_jsonify["commands"].append({"name" : command, "longitude": longitude, "latitude": latitude})
    
  return jsonify({'result': to_jsonify})
# send images
@app.route('/images')
@cross_origin()
def images():
  path = request.args['study']
  cwd = os.getcwd()

  directory = f"{cwd}/data/{path}"
  with open(f"{directory}/calibration.json", "r") as f:
            calib_file = json.load(f)
  to_jsonify = {}
  encoded_images = []
  centers = {}
  centers_x = []
  centers_y = []
  centers_z = []
  for image_name in calib_file["extrinsics"]:
    try:
      image_data = get_response_image(f"{directory}/{calib_file['thumbnails']}/{image_name}")
      image_data["name"] = image_name
      
      mat = np.matrix(calib_file["extrinsics"][image_name]["matrix"])
      rotation = mat[0:3, 0:3]
      trans = mat[0:3, 3]
      C = converters.get_camera_world_coordinates(rotation, trans)
      
      centers[image_name] = C
      centers_x.append(C.item(0)) # x
      centers_y.append(C.item(1)) # y
      centers_z.append(C.item(2)) # z
            
      encoded_images.append(image_data)
    except Exception as error:
       print(error)
       continue
  _, center = reconstruction.sphereFit(centers_x, centers_y, centers_z)
  
  for image_data in encoded_images:
    image_name = image_data["name"]
    C = centers[image_name]
    vec = C - center
    long, lat = converters.get_long_lat(vec)
    image_data["longitude"], image_data["latitude"] = converters.rad2degrees(long), converters.rad2degrees(lat)
    
  to_jsonify["images"] = encoded_images
  return jsonify({'result': to_jsonify})

if __name__ == '__main__':
    app.run()