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

BUILD_UTIME=`date "+%s"`
BUILD_YEAR=`date "+%Y"`
BUILD_MONTH=`date "+%m"`
BUILD_DAY=`date "+%d"`
BUILD_YMD=`date "+%Y%m%d"`
BUILD_HOUR=`date "+%H"`
BUILD_MINUTE=`date "+%M"`
BUILD_HM=`date "+%H%M"`
BUILD_SECOND=`date "+%S"`
BUILD_HMS=`date "+%H%M%S"`
BUILD_MSEC=`date "+%3N"`
BUILD_NSEC=`date "+%N"`
BUILD_TZ=`date "+%z"`
BUILD_ISO8601=`date '+%FT%T%Z'`
BUILD_ISO8601_UTC=`date --utc '+%FT%TZ'`
BUILD_ISO8601_UTC_MSEC=`date --utc '+%FT%T.%3NZ'`
BUILD_COMMIT=`git rev-parse HEAD`

declare -A BUILD_INFO=(
  ["DATE"]="${BUILD_DATE}"
  ["UTIME"]="${BUILD_UTIME}"
  ["YEAR"]="${BUILD_YEAR}"
  ["MONTH"]="${BUILD_MONTH}"
  ["DAY"]="${BUILD_DAY}"
  ["YMD"]="${BUILD_YMD}"
  ["HOUR"]="${BUILD_HOUR}"
  ["MINUTE"]="${BUILD_MINUTE}"
  ["HM"]="${BUILD_HM}"
  ["SECOND"]="${BUILD_SECOND}"
  ["HMS"]="${BUILD_HMS}"
  ["MSEC"]="${BUILD_MSEC}"
  ["NSEC"]="${BUILD_NSEC}"
  ["TZ"]="${BUILD_TZ}"
  ["ISO8601"]="${BUILD_ISO8601}"
  ["ISO8601_UTC"]="${BUILD_ISO8601_UTC}"
  ["ISO8601_UTC_MSEC"]="${BUILD_ISO8601_UTC_MSEC}"
  ["COMMIT"]="${BUILD_COMMIT}"
)

function set_build_info() {
  local fname=$1
  local key=""
  local val=""
  for key in "${!BUILD_INFO[@]}"; do
    val=${BUILD_INFO[$key]}
    sed -i -e "s/@__REPLACE__BUILD_INFO_${key}__@/${val}/g" "${fname}"
  done
}

FIRSTLOAD_FILES=("functions.js")
SECONDLOAD_DIRS=("utils")
LASTLOAD_DIRS=("vendor")

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
    local secondload_dirs=$?
    chk_loaded $LASTLOAD_DIRS $dir
    local lastload_dirs=$?    
    if [ $secondload_dirs -eq 0 -a $lastload_dirs -eq 0 ]; then
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

  for dir in ${LASTLOAD_DIRS[@]}; do
    if [ -d "${SRC}/${MAIN}/${_dir}/${dir}" ]; then
      target=${_dir}/${dir}
      build $target $_lv
      cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
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
set_build_info "${OUT}/${OUTFILE}"
cp -f "${OUT}/${OUTFILE}" "js/${OUTFILE}"
