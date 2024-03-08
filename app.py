from flask import Flask, render_template, jsonify

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
    return {"image": encoded_img,
            "format": pil_img.format.lower()
          }

# send_images page
@app.route('/images')
@cross_origin()
def images():
  cwd = os.getcwd()

  directory = f"{cwd}/data/geonemus-geoffroyii"
  with open(f"{directory}/calibration.json", "r") as f:
            calib_file = json.load(f)
  to_jsonify = {}
  encoded_images = {}
  centers = {}
  for image_path in calib_file["extrinsics"]:
    try:
      image_data = get_response_image(f"{directory}/{calib_file['thumbnails']}/{image_path}")
      
      mat = np.matrix(calib_file["extrinsics"][image_path]["matrix"])
      rotation = mat[0:3, 0:3]
      trans = mat[0:3, 3]
      C = converters.get_camera_world_coordinates(rotation, trans)
      
      centers[image_path] = C
      centers_x = []
      centers_y = []
      centers_z = []
      centers_x.append(C.item(0)) # x
      centers_y.append(C.item(1)) # y
      centers_z.append(C.item(2)) # z
            
      encoded_images[image_path] = image_data
    except:
       continue
  _, center = reconstruction.sphereFit(centers_x, centers_y, centers_z)
  
  for image_path in encoded_images:
    C = centers[image_path]
    encoded_images[image_path]
    vec = C - center
    long, lat = converters.get_long_lat(vec)
    encoded_images[image_path]["longitude"], encoded_images[image_path]["latitude"] = converters.degrees2rad(long), converters.degrees2rad(lat)

  print(encoded_images["_x_00400_y_02880_step_06200_.jpg"].keys())
    
  to_jsonify["images"] = encoded_images
  return jsonify({'result': to_jsonify})

if __name__ == '__main__':
    app.run()