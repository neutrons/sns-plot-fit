from flask import Flask, jsonify, request, send_from_directory
import json
from pprint import pprint

'''

Install:
pip install Flask --user


Run as:
python3 server.py
In:
sns-plot-fit/src/assets

'''

# app = Flask(__name__)
# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')

data = [
    {
        "job_id": "1",
        "job_title": "Reduction 1",
        "date_modified": "2017-08-17T17:23:28.091Z",
        "results": [
            {
                "id": "1",
                "filename": "A1_m_Iq",
                "url": "/external/files/sans1d/A1_m_Iq.txt"
            },
            {
                "id": "2",
                "filename": "aC3_6_T12hS90_w_Iq",
                "url": "/external/files/sans1d/aC3_6_T12hS90_w_Iq.txt"
            },
            {
                "id": "3",
                "filename": "A3_m_Iq",
                "url": "/external/files/sans1d/A3_m_Iq.txt"
            },
            {
                "id": "4",
                "filename": "A1_m_Iqxy",
                "url": "/external/files/sans2d/A1_m_Iqxy.dat"
            }
        ]
    },
    {
        "job_id": "2",
        "job_title": "Reduction 2",
        "date_modified": "2017-09-17T17:23:20.091Z",
        "results": [
            {
                "id": "1",
                "filename": "A4_m_Iq",
                "url": "/external/files/sans1d/A3_m_Iq.txt"
            },
            {
                "id": "2",
                "filename": "A3_w_Iq",
                "url": "/external/files/sans1d/A3_w_Iq.txt"
            },
            {
                "id": "3",
                "filename": "A2_m_Iqxy",
                "url": "/external/files/sans2d/A2_m_Iqxy.dat"
            }
        ]
    }
]

@app.route('/files/<path:path>')
def file_download(path):
    '''
    this serves files in the data directory
    Test:
    curl http://localhost:8000/files/file1.csv
    '''
    import os 
    dir_path = os.path.dirname(os.path.realpath(__file__))

    print('Server running here:', dir_path)
    print('Path requested:', path)
    print('Full path', os.path.join(dir_path, 'datasets', path))
    
    return send_from_directory('datasets', path)

@app.route('/save', methods=['POST'])
def save():
    '''
    To test:
    curl -H "Content-Type: application/json" -X POST -d \
    '{"id":"1","content":"12456"}' http://localhost:8000/save
    '''
    json_data = request.json
    print(80*"*")
    pprint(json_data)
    print(80*"*")
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/fetch', methods=['GET'])
def fetch():
    print(request)
    return jsonify(data)



if __name__ == "__main__":
    print("Starting server")
    # app.run()
    app.run(host= '0.0.0.0', port=8000 ,debug=True)
