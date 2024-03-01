#!/bin/bash

OUTFILE="tie.js"
OUT="./build/"
TMP="./build/tmp/"
SRC="./src/"
MAIN="main/"
TEMPLATE="template/"
MODBASETOP="mod.base.top.js"
MODBASEBOTTOM="mod.base.bottom.js"
MODTOP="mod.top.js"
MODBOTTOM="mod.bottom.js"
JSTOP="top.js"
JSBOTTOM="bottom.js"

if [ -e "$TMP" ]; then
  rm -rf "$TMP"
fi

mkdir -p "$TMP"
mkdir -p "$OUT"

function build () {
  local _dir=${1}
  local _lv=`expr 1 + ${2}`
  local dir=""
  local file=""
  local target=""
  local sdir=""
  local s2dir=""
  sdir=$_dir
  sdir=${sdir//\\/\\\\}
  sdir=${sdir//\"/\\\"}
  #sdir=${sdir//\//\\\/}
  sdir=${sdir//\//.}
  sdir=${sdir//\&/\\\&}
  s2dir=`echo ${sdir} | sed -E "s/^.*\.([^.]+)/\1/"`
  mkdir -p "${TMP}/${_dir}"
  touch "${TMP}/${_dir}/center.tjs"
  for dir in `find "${SRC}/${MAIN}/${_dir}" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n'`; do
    target=${_dir}/${dir}
    build $target $_lv
    cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
  done
  for file in `find "${SRC}/${MAIN}/${_dir}" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n'`; do
    echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
    echo "// module: $sdir , from: $file" >> "${TMP}/${_dir}/center.tjs"
    echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
    cat "${SRC}/${MAIN}/${_dir}/${file}" >> "${TMP}/${_dir}/center.tjs"
    echo "" >> "${TMP}/${_dir}/center.tjs"
  done
  if [ $_lv -eq 1 ]; then
    cat "${SRC}/${TEMPLATE}/${MODBASETOP}" "${TMP}/${_dir}/center.tjs" "${SRC}/${TEMPLATE}/${MODBASEBOTTOM}" > "${TMP}/${_dir}/module.tjs"
  else
    cat "${SRC}/${TEMPLATE}/${MODTOP}" "${TMP}/${_dir}/center.tjs" "${SRC}/${TEMPLATE}/${MODBOTTOM}" > "${TMP}/${_dir}/module.tjs"
  fi
  sed -i -e "s/@MODULE_NAME@/${sdir}/g" "${TMP}/${_dir}/module.tjs"
  sed -i -e "s/@MODULE_SHORT_NAME@/${s2dir}/g" "${TMP}/${_dir}/module.tjs"
}

touch "${TMP}/center.tjs"

for dir in `find "${SRC}/${MAIN}/" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n'`; do
  build $dir 0
  cat "${TMP}/${dir}/module.tjs" >> "${TMP}/center.tjs"
done

for file in `find "${SRC}/${MAIN}/" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n'`; do
  echo "// ================================================" >> "${TMP}/center.tjs"
  echo "// source: $file" >> "${TMP}/center.tjs"
  echo "// ================================================" >> "${TMP}/center.tjs"
  cat "${SRC}/${MAIN}/${file}" >> "${TMP}/center.tjs"
  echo "" >> "${TMP}/center.tjs"
done

cat "${SRC}/${TEMPLATE}/${JSTOP}" "${TMP}/center.tjs" "${SRC}/${TEMPLATE}/${JSBOTTOM}" > "${OUT}/${OUTFILE}"

