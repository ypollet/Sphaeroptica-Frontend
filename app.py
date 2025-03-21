from flask import Flask, render_template, jsonify, request, send_from_directory, abort

from flask_cors import CORS, cross_origin

import pystache
from base64 import encodebytes
import glob
import io
import os
from PIL import Image
import json
import numpy as np

from photogrammetry import helpers, converters, reconstruction


cwd = os.getcwd()

# configuration
DEBUG = True
DATA_FOLDER = f"{cwd}/data"

# instantiate the app
app = Flask(__name__, static_folder="/dist", static_url_path="/static")
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"
app.config.from_object(__name__)

# definitions
SITE = {"logo": "Sphaeroptica", "version": "2.0.0"}

OWNER = {
    "name": "Royal Belgian Institute of Natural Sciences",
}

# pass data to the frontend
site_data = {"site": SITE, "owner": OWNER}


# landing page
@app.route("/")
def welcome(id):
    return render_template("index.html", **site_data)


@app.route("/<id>/triangulate", methods=["POST"])
def triangulate(id):
    if request.method == "POST":
        data = request.get_json()
        poses = data["poses"]
        directory = f"{DATA_FOLDER}/{id}"
        with open(f"{directory}/calibration.json", "r") as f:
            calib_file = json.load(f)

        intrinsics = np.matrix(calib_file["intrinsics"]["camera matrix"]["matrix"])
        dist_coeffs = np.matrix(calib_file["intrinsics"]["distortion matrix"]["matrix"])
        proj_points = []
        for image in poses:
            extrinsics = np.matrix(calib_file["extrinsics"][image]["matrix"])
            proj_mat = reconstruction.projection_matrix(intrinsics, extrinsics)
            pose = np.matrix([poses[image]["x"], poses[image]["y"]])
            undistorted_pos = reconstruction.undistort_iter(
                np.array([pose]).reshape((1, 1, 2)), intrinsics, dist_coeffs
            )
            proj_points.append(helpers.ProjPoint(proj_mat, undistorted_pos))

        # Triangulation computation with all the undistorted landmarks
        landmark_pos = reconstruction.triangulate_point(proj_points)
        return jsonify(landmark_pos.tolist())


@app.route("/<id>/reproject", methods=["POST"])
def reproject(id):
    if request.method == "POST":
        data = request.get_json()
        position = np.array(data["position"])
        image_name = data["image"]

        directory = f"{DATA_FOLDER}/{id}"
        with open(f"{directory}/calibration.json", "r") as f:
            calib_file = json.load(f)

        intrinsics = np.matrix(calib_file["intrinsics"]["camera matrix"]["matrix"])
        dist_coeffs = np.matrix(calib_file["intrinsics"]["distortion matrix"]["matrix"])
        extrinsics = np.matrix(calib_file["extrinsics"][image_name]["matrix"])[0:3, 0:4]

        pose = reconstruction.project_points(
            position, intrinsics, extrinsics, dist_coeffs
        )

        return {"x": pose.item(0), "y": pose.item(1)}


def get_response_image(image_path):
    pil_img = Image.open(image_path, mode="r")  # reads the PIL image
    byte_arr = io.BytesIO()
    pil_img.save(byte_arr, format=pil_img.format)  # convert the PIL image to byte array
    encoded_img = encodebytes(byte_arr.getvalue()).decode("ascii")  # encode as base64

    return {
        "thumbnail": f"data:image/{pil_img.format.lower()};base64, {encoded_img}",
    }


# send single image
@app.route("/<id>/<image_name>/full-image")
@cross_origin()
def image(id, image_name):
    print(f"Image for {id}/{image_name}")
    directory = f"{DATA_FOLDER}/{id}"

    return send_from_directory(directory, f"{image_name}")


# send single image
@app.route("/<id>/<image_name>/thumbnail")
@cross_origin()
def thumbnail(id, image_name):
    print(f"Thumbnail for {id}/{image_name}")
    directory = f"{DATA_FOLDER}/{id}"
    with open(f"{directory}/calibration.json", "r") as f:
        calib_file = json.load(f)

    return send_from_directory(
        f"{directory}/{calib_file['thumbnails']}", f"{image_name}"
    )


# send_shortcuts page
@app.route("/<id>/shortcuts")
@cross_origin()
def shortcuts(id):
    directory = f"{DATA_FOLDER}/{id}"
    with open(f"{directory}/calibration.json", "r") as f:
        calib_file = json.load(f)
    return jsonify(calib_file["commands"])


# send images
@app.route("/<id>/images")
@cross_origin()
def images(id):
    directory = f"{DATA_FOLDER}/{id}"
    if not os.path.exists(directory):
        abort(404)
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
            image_data = get_response_image(
                f"{directory}/{calib_file['thumbnails']}/{image_name}"
            )
            image_data["name"] = image_name

            mat = np.matrix(calib_file["extrinsics"][image_name]["matrix"])
            rotation = mat[0:3, 0:3]
            trans = mat[0:3, 3]
            C = converters.get_camera_world_coordinates(rotation, trans)

            centers[image_name] = C
            centers_x.append(C.item(0))  # x
            centers_y.append(C.item(1))  # y
            centers_z.append(C.item(2))  # z

            encoded_images.append(image_data)
        except Exception as error:
            print(error)
            continue
    radius, center = reconstruction.sphereFit(centers_x, centers_y, centers_z)

    for image_data in encoded_images:
        image_name = image_data["name"]
        C = centers[image_name]
        vec = C - center
        long, lat = converters.get_long_lat(vec)
        image_data["coordinates"] = {
            "longitude": converters.rad2degrees(long),
            "latitude": converters.rad2degrees(lat),
        }
    to_jsonify = {
        "images": encoded_images,
        "size": {
            "height": calib_file["intrinsics"]["height"],
            "width": calib_file["intrinsics"]["width"],
        },
        "thumbnails": "thumbnails" in calib_file,
    }
    return jsonify(to_jsonify)


if __name__ == "__main__":
    app.run(port=5001)
