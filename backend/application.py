from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from importlib import import_module
from os import path, listdir
from solver import solve

#Run this file for testing.

app = Flask(__name__)
CORS(app, supports_credentials=True) 

@app.route('/get_apps', methods=['GET'])
@cross_origin(supports_credentials=True)
def send_all_apps():
   appIDs = []
   current_directory = path.dirname(__file__)
   problems_folder = path.join(current_directory, 'problems')
   for filename in listdir(problems_folder):
      if filename.endswith('.py'):
         appIDs.append(path.splitext(filename)[0])
   appIDs.sort()
   return jsonify(appIDs)

@app.route('/run_app', methods=['POST'])
@cross_origin(supports_credentials=True)
def run_app():
    data = request.get_json()
    pid = data["pid"]
    try:
        module_name = "problems." + pid #MUST HAVE ID
        module = import_module(module_name) #FILE MUST BE SAME NAME AS ID
        if hasattr(module, "main"): #MUST HAVE MAIN
            get_cqm = getattr(module, "main")
            cqm = get_cqm(data["data"])
            solved = solve(cqm) #solver.py
            return jsonify(solved)
        return jsonify({"error": "Function main not found for " + pid + "!"})
    except Exception as e:
        return jsonify({"error": "An exception occurred: " + repr(e)})

if __name__ == '__main__':
   app.run(host='localhost', port=8080)