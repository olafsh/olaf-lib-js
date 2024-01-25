#!/bin/bash

open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/chrome-tmp" --disable-web-security "https://$OLAF_DOMAIN:3000"