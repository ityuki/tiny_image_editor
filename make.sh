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

FIRSTLOAD_FILES=("functions.js")
SECONDLOAD_DIRS=("utils")

function chk_loaded() {
  local files=$1
  local fname=$2
  local i=""
  for i in ${files[@]}; do
    if [ "$i" == "$fname" ]; then
      return 1
    fi
  done
  return 0
}

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

  for file in ${FIRSTLOAD_FILES[@]}; do
    if [ -f "${SRC}/${MAIN}/${_dir}/${file}" ]; then
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      echo "// module: $sdir , from: $file" >> "${TMP}/${_dir}/center.tjs"
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      cat "${SRC}/${MAIN}/${_dir}/${file}" >> "${TMP}/${_dir}/center.tjs"
      echo "" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for dir in ${SECONDLOAD_DIRS[@]}; do
    if [ -d "${SRC}/${MAIN}/${_dir}/${dir}" ]; then
      target=${_dir}/${dir}
      build $target $_lv
      cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for dir in `find "${SRC}/${MAIN}/${_dir}" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
    chk_loaded $SECONDLOAD_DIRS $dir
    if [ $? -eq 0 ]; then
      target=${_dir}/${dir}
      build $target $_lv
      cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for file in `find "${SRC}/${MAIN}/${_dir}" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
    chk_loaded $FIRSTLOAD_FILES $file
    if [ $? -eq 0 ]; then
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      echo "// module: $sdir , from: $file" >> "${TMP}/${_dir}/center.tjs"
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      cat "${SRC}/${MAIN}/${_dir}/${file}" >> "${TMP}/${_dir}/center.tjs"
      echo "" >> "${TMP}/${_dir}/center.tjs"
    fi
  done
  if [ $_lv -eq 1 ]; then
    cp -f "${SRC}/${TEMPLATE}/${MODBASETOP}" "${TMP}/${_dir}/top.tjs"
    cp -f "${SRC}/${TEMPLATE}/${MODBASEBOTTOM}" "${TMP}/${_dir}/bottom.tjs"
  else
    cp -f "${SRC}/${TEMPLATE}/${MODTOP}" "${TMP}/${_dir}/top.tjs"
    cp -f "${SRC}/${TEMPLATE}/${MODBOTTOM}" "${TMP}/${_dir}/bottom.tjs"
  fi
  sed -i -e "s/@MODULE_NAME@/${sdir}/g" "${TMP}/${_dir}/top.tjs"
  sed -i -e "s/@MODULE_SHORT_NAME@/${s2dir}/g" "${TMP}/${_dir}/top.tjs"
  sed -i -e "s/@MODULE_NAME@/${sdir}/g" "${TMP}/${_dir}/bottom.tjs"
  sed -i -e "s/@MODULE_SHORT_NAME@/${s2dir}/g" "${TMP}/${_dir}/bottom.tjs"
  cat "${TMP}/${_dir}/top.tjs" "${TMP}/${_dir}/center.tjs" "${TMP}/${_dir}/bottom.tjs" > "${TMP}/${_dir}/module.tjs"
}

touch "${TMP}/center.tjs"

for file in ${FIRSTLOAD_FILES[@]}; do
  if [ -f "${SRC}/${MAIN}/${file}" ]; then
    echo "// ================================================" >> "${TMP}/center.tjs"
    echo "// source: $file" >> "${TMP}/center.tjs"
    echo "// ================================================" >> "${TMP}/center.tjs"
    cat "${SRC}/${MAIN}/${file}" >> "${TMP}/center.tjs"
    echo "" >> "${TMP}/center.tjs"
  fi
done

for dir in ${SECONDLOAD_DIRS[@]}; do
  if [ -d "${SRC}/${MAIN}/${dir}" ]; then
    build $dir 0
    cat "${TMP}/${dir}/module.tjs" >> "${TMP}/center.tjs"
  fi
done

for dir in `find "${SRC}/${MAIN}/" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
  chk_loaded $SECONDLOAD_DIRS $dir
  if [ $? -eq 0 ]; then
    build $dir 0
    cat "${TMP}/${dir}/module.tjs" >> "${TMP}/center.tjs"
  fi
done

for file in `find "${SRC}/${MAIN}/" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
  chk_loaded $FIRSTLOAD_FILES $file
  if [ $? -eq 0 ]; then
    echo "// ================================================" >> "${TMP}/center.tjs"
    echo "// source: $file" >> "${TMP}/center.tjs"
    echo "// ================================================" >> "${TMP}/center.tjs"
    cat "${SRC}/${MAIN}/${file}" >> "${TMP}/center.tjs"
    echo "" >> "${TMP}/center.tjs"
  fi
done

cat "${SRC}/${TEMPLATE}/${JSTOP}" "${TMP}/center.tjs" "${SRC}/${TEMPLATE}/${JSBOTTOM}" > "${OUT}/${OUTFILE}"
cp -f "${OUT}/${OUTFILE}" "js/${OUTFILE}"
