# visitorLogger - A simple visitor logger for the website
# https://github.com/lwd-temp/visitorLogger
# HTML Report Generator
import os
import sqlite3

import htmlmin


def minifyHTML(html):
    # Minify the HTML report with HTMLMin
    return htmlmin.minify(html, remove_empty_space=True)


def createFullReport(db):
    # Create the HTML report
    # Header
    html = '<html><head>'
    # charset
    html += '<meta charset="utf-8">'
    # title
    html += '<title>Visitor Logger</title>'
    # Append Style to the HTML report
    html += '<style>table, th, td {border: 1px solid black;border-collapse: collapse;}</style>'
    # Append JS filter to the HTML report
    html += '<script>function filterTable() {var input, filter, table, tr, td, i;input = document.getElementById("myInput");filter = input.value.toUpperCase();table = document.getElementById("myTable");tr = table.getElementsByTagName("tr");for (i = 0; i < tr.length; i++) {td = tr[i].getElementsByTagName("td")[0];if (td) {if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {tr[i].style.display = "";} else {tr[i].style.display = "none";}}} }</script>'
    # Body
    html += '</head><body>'
    # Title
    html += '<h1>Visitor Logger</h1>'
    # Append the filter input to the HTML report
    html += '<input type="text" id="myInput" onkeyup="filterTable()" placeholder="Search for UUID..">'
    # Append the table to the HTML report
    html += '<table id="myTable"><tr><th>UUID</th><th>IP</th><th>Time</th><th>User Agent</th><th>Referrer</th><th>Extension</th><th>Header</th></tr>'
    # Create a DB connection
    db = sqlite3.connect(db, check_same_thread=False)
    # Create a cursor
    c = db.cursor()
    # Get the data from the DB
    c.execute("SELECT * FROM visitors")
    # Loop through the data
    for row in c:
        # Add the data to the HTML report
        html += '<tr><td>' + str(row[0]) + '</td><td>' + str(row[1]) + '</td><td>' + str(row[2]) + '</td><td>' + str(
            row[3]) + '</td><td>' + str(row[4]) + '</td><td>' + str(row[5]) + '</td><td>' + str(row[6]) + '</td></tr>'
    # Close the DB connection
    db.close()
    # Add the closing tags to the HTML report
    html += '</table></body></html>'
    # Return the HTML report
    return html


if __name__ == "__main__":
    # Get db days filename from arguemnts
    db = str(os.sys.argv[1])
    filename = str(os.sys.argv[2])
    # Create the HTML report
    html = createFullReport(db)
    # Minify
    html = minifyHTML(html)
    # Write the HTML report to a file with UTF-8 encoding
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    # Return a success message
    print('Created')
    # Exit the program
    exit()
# End of file
