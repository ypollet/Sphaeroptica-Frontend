from flask import Flask, render_template, jsonify

from flask_cors import CORS, cross_origin

from base64 import encodebytes
import glob
import io
import os
from PIL import Image



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
    return encoded_img

# send_images page
@app.route('/images')
@cross_origin()
def images():
  cwd = os.getcwd()
  print(cwd)
  result = glob.glob(f"{cwd}/data/geonemus-geoffroyii/thumbnails/*")
  encoded_images = {}
  for image_path in result:
    try:
      encoded_images[os.path.basename(image_path)] = get_response_image(image_path)
    except:
       continue
  
  to_jsonify = {}
  to_jsonify["images"] = encoded_images
  return jsonify({'result': encoded_images})

if __name__ == '__main__':
    app.run()