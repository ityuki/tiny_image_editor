all:
	bash buildsys/make.sh

sample:
	cd buildsys/sample && bash ../make.sh

sampleRun:
	cd buildsys/sample && node run_sample.js

