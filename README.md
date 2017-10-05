# Small Angle Scattering Web Data Analysis framework

Features:

* 1D Data analysis:
    - Fitting of General SAS Curves (Guinier, Porod, etc)
    - Fitting of user defined curves / equations
* 2D Data analysis:
    - Hexagonal rebining of I(qx,qy) data
* 1D curve stitching / merging


## Create a .env file

Copy `env.base` to `.env` and modify it according to your needs.

## Start file provider mocking server

Note that the mocking server needs `Python Flask`.

First check if flask is installed:

```
python -c "import flask; print(flask.__version__);"
```

If no errors are displayed, you are good to go. Otherwise install Flask:

```
pip install Flask --user
```

To launch the server:

```bash
cd src/assets
python server.py
```

Or in a different host / port:

```
usage: server.py [-h] [--host [HOST]] [--port [PORT]]

optional arguments:
  -h, --help            show this help message and exit
  --host [HOST], -o [HOST]
                        default host: localhost
  --port [PORT], -p [PORT]
                        default port: 8000
```

The server can be tested with:
http://localhost:8000/files/sans1d/A1_m_Iq_wedge_0.txt


## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
