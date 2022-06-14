# visitorLogger - A simple visitor logger for the website
# Flask Backend
import sqlite3
import time

import flask

# Create the application object
app = flask.Flask(__name__)
# Create a DB connection
db = sqlite3.connect('visitor.db', check_same_thread=False)
# Create a cursor
c = db.cursor()
# Create a table
c.execute("""CREATE TABLE IF NOT EXISTS visitors (
            uuid TEXT,
            ip TEXT,
            time TEXT,
            ua TEXT,
            referrer TEXT,
            ext TEXT,
            header TEXT)""")
# Commit the changes
db.commit()
# Close the DB connection
db.close()


@app.route("/append")
# Append a new visitor to the DB, any method can be used
def append():
    # Get the data from the request
    try:
        uuid = str(flask.request.values.get('uuid'))
    except:
        uuid = 'None'
    try:
        ext = str(flask.request.values.get('ext'))
    except:
        ext = 'None'
    try:
        ip = str(flask.request.headers["X-Forwarded-For"])
    except:
        ip = str(flask.request.remote_addr)
    try:
        ua = str(flask.request.headers["User-Agent"])
    except:
        ua = 'None'
    try:
        referrer = str(flask.request.headers["Referer"])
    except:
        referrer = 'None'
    try:
        header = str(flask.request.headers)
    except:
        header = 'None'
    currtime = time.strftime("%Y-%m-%d %H:%M:%S")
    # Create a DB connection
    db = sqlite3.connect('visitor.db', check_same_thread=False)
    # Create a cursor
    c = db.cursor()
    # Insert the data
    c.execute("""INSERT INTO visitors VALUES (?,?,?,?,?,?,?)""",
              (uuid, ip, currtime, ua, referrer, ext, header))
    # Commit the changes
    db.commit()
    # Close the DB connection
    db.close()
    # Make a response
    resp = flask.make_response(flask.jsonify(
        {"uuid": uuid, "ip": ip, "time": currtime, "ua": ua, "referrer": referrer, "ext": ext, "header": header}), 200)
    # Allow Cross Origin Resource Sharing
    resp.headers['Access-Control-Allow-Origin'] = "*"
    # Return the data
    return resp


@app.route("/post", methods=['POST'])
# Append a new visitor to the DB, using POST
def post():
    # Get the data from the request
    try:
        uuid = str(flask.request.form['uuid'])
    except:
        uuid = 'None'
    try:
        ext = str(flask.request.form['ext'])
    except:
        ext = 'None'
    try:
        ip = str(flask.request.headers["X-Forwarded-For"])
    except:
        ip = str(flask.request.remote_addr)
    try:
        ua = str(flask.request.headers["User-Agent"])
    except:
        ua = 'None'
    try:
        referrer = str(flask.request.headers["Referer"])
    except:
        referrer = 'None'
    try:
        header = str(flask.request.headers)
    except:
        header = 'None'
    currtime = time.strftime("%Y-%m-%d %H:%M:%S")
    # Create a DB connection
    db = sqlite3.connect('visitor.db', check_same_thread=False)
    # Create a cursor
    c = db.cursor()
    # Insert the data
    c.execute("""INSERT INTO visitors VALUES (?,?,?,?,?,?,?)""",
              (uuid, ip, currtime, ua, referrer, ext, header))
    # Commit the changes
    db.commit()
    # Close the DB connection
    db.close()
    # Make a response
    resp = flask.make_response(flask.jsonify(
        {"uuid": uuid, "ip": ip, "time": currtime, "ua": ua, "referrer": referrer, "ext": ext, "header": header}), 200)
    # Allow Cross Origin Resource Sharing
    resp.headers['Access-Control-Allow-Origin'] = "*"
    # Return the data
    return resp


@app.route("/")
# Return the index page
def index():
    # Make a response
    resp = flask.make_response("""<html>
    <head>
    <title>Visitor Logger</title>
    </head>
    <body>
    <h1>Visitor Logger</h1>
    <p>This is a simple visitor logger for the website.</p>
    <p>You can use the following endpoints:</p>
    <ul>
    <li>/append - Append a new visitor to the DB</li>
    <li>/post - Append a new visitor to the DB using POST</li>
    </ul>
    </body>
    </html>""")
    # Allow Cross Origin Resource Sharing
    resp.headers['Access-Control-Allow-Origin'] = "*"
    # Return the data
    return resp


# Run the application, no debug
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=False)
# End of file
