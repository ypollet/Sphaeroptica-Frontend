from flask import Flask, render_template, jsonify

from flask_cors import CORS, cross_origin

from base64 import encodebytes
import glob
import io
import os
from PIL import Image
import json



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
    print(image_path)
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
  print(cwd)

  directory = f"{cwd}/data/geonemus-geoffroyii"
  with open(f"{directory}/calibration.json", "r") as f:
            calib_file = json.load(f)
  to_jsonify = {}
  encoded_images = {}
  for image_path in calib_file["extrinsics"]:
    try:
      image_data = get_response_image(f"{directory}/{calib_file['thumbnails']}/{image_path}")
      image_data["matrix"] = calib_file["extrinsics"][image_path]["matrix"]
      encoded_images[image_path] = image_data
    except:
       continue
  to_jsonify["images"] = encoded_images
  return jsonify({'result': to_jsonify})

if __name__ == '__main__':
    app.run()