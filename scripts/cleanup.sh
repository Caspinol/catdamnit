#!/usr/bin/fish
# Test 2
# EC2 instance working directory
WORK_DIR=/home/ubuntu/www/catdamnit

# Cleanup deployment dir
rm -rf $WORK_DIR/bin
rm -rf $WORK_DIR/lib
rm -rf $WORK_DIR/public
rm -rf $WORK_DIR/routes
rm -rf $WORK_DIR/views
rm -rf $WORK_DIR/package.json
rm -rf $WORK_DIR/server.js
rm -rf $WORK_DIR/scripts

