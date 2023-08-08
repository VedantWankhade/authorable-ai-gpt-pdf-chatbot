#!/bin/bash
cd /Users/karthik/Teaching/psForAEM 
# Check if the correct number of arguments is provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 param1 param2 param3 ..."
  exit 1
fi

# Loop through the array of parameters
# npm uninstall playwright
# npm install -D @playwright/test
for param in "$@"; do
  echo "Processing parameter: $param"
  npx playwright test $param
  # For example: echo "Running command with parameter: $param"
done

echo $?