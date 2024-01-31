from flask import Flask, render_template, jsonify

from flask_cors import CORS, cross_origin



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

if __name__ == '__main__':
    app.run()