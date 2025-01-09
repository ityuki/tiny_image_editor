all:
	bash buildsys/make.sh

sample:
	cd buildsys/sample && bash ../make.sh

sampleRun:
	cd buildsys/sample && node --experimental-modules run_sample.mjs

