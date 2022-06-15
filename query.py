# visitorLogger - A simple visitor logger for the website
# https://github.com/lwd-temp/visitorLogger
# Call Query API & CSV Report Generator
import csv
import json

import requests

# Get the API URL
api_url = input("Enter the Query API URL: ")
secret = input("Enter the secret key: ")
hours = input("Enter the number of hours to query: ")

# Request the API
response = requests.get(api_url, params={"secret": secret, "hours": hours})

# Check if the request was successful
if response.status_code != 200:
    print("Error: " + response.text)
    exit(1)

# Parse the response
data = json.loads(response.text)

# Create a CSV file
with open('visitors.csv', 'w', newline='') as csvfile:
    # Create a CSV writer
    writer = csv.writer(csvfile, delimiter=',',
                        quotechar='"', quoting=csv.QUOTE_MINIMAL)
    # Write the header
    writer.writerow(['uuid', 'ip', 'time', 'ua', 'referrer', 'ext', 'header'])
    # Write the data
    for row in data:
        writer.writerow(row)

# Print the data
print("\n")
print("Visitors: " + str(len(data)))
print("\n")
print("Data: ")
print(data)
