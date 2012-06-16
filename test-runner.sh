#!/bin/bash

set -e

cd test

for test in `ls *-test.js`; do
	echo "Launching test : $test"
	vows $test --spec
	echo ""
done
