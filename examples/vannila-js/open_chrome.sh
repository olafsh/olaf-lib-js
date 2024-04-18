#!/bin/bash

open -n -a /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --args --user-data-dir="/chrome-tmp" --disable-web-security "https://$OLAF_DOMAIN:3000"