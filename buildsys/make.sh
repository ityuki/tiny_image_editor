#!/bin/bash
# runnning from project root

start_time=`date "+%s%3N"`

. ./buildsys.conf

OUTDIR="${OUT_DIR}"
OUTFILE="${OUT_FILE}"
OUT="${BUILD_DIR}"
TMP="${BUILD_DIR}/tmp"
SRC="${SRC_DIR}"
TEMPLATE="${TEMPLATE_DIR}"
MODBASETOP="mod.base.top.js"
MODBASEBOTTOM="mod.base.bottom.js"
MODTOP="mod.top.js"
MODBOTTOM="mod.bottom.js"
JSTOP="top.js"
JSBOTTOM="bottom.js"

echo "  build start: ${OUTDIR}/${OUTFILE}"

if [ -e "$OUT" ]; then
  rm -rf "$OUT"
fi
if [ -e "$TMP" ]; then
  rm -rf "$TMP"
fi
if [ -e "$OUTDIR" ]; then
  rm -rf "$OUTDIR"
fi

mkdir -p "$TMP"
mkdir -p "$OUT"
mkdir -p "$OUTDIR"

echo "  build start: ${OUTDIR}/${OUTFILE}" >> "${BUILD_DIR}/build.log"


BUILD_APP_VERSION=$APP_VERSION
BUILD_APP_NAME=$APP_NAME
BUILD_APP_ID=$APP_ID

BUILD_UTIME_USEC_TIMESTAMP=`date "+%s.%N"`

BUILD_UTIME=`date "+%s" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_YEAR=`date "+%Y" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_MONTH=`date "+%m" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DAY=`date "+%d" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_YMD=`date "+%Y%m%d" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_HOUR=`date "+%H" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_MINUTE=`date "+%M" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_HM=`date "+%H%M" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_SECOND=`date "+%S" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_HMS=`date "+%H%M%S" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_MSEC=`date "+%3N" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_NSEC=`date "+%N" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_TZ=`date "+%Z"`
BUILD_OFFSET=`date "+%z" | sed 's/^\(...\)/\1:/'`
BUILD_ISO8601=`date '+%FT%T'${BUILD_OFFSET} -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_ISO8601_MSEC=`date '+%FT%T.%3N'${BUILD_OFFSET} -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_ISO8601_UTC=`date --utc '+%FT%TZ' -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_ISO8601_UTC_MSEC=`date --utc '+%FT%T.%3NZ' -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE=`date "+%Y-%m-%d %H:%M:%S %Z" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_MSEC=`date "+%Y-%m-%d %H:%M:%S.%3N %Z" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_NO_TZ=`date "+%Y-%m-%d %H:%M:%S" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_MSEC_NO_TZ=`date "+%Y-%m-%d %H:%M:%S.%3N" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_UTC=`date --utc "+%Y-%m-%d %H:%M:%S" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_UTC_MSEC=`date --utc "+%Y-%m-%d %H:%M:%S.%3N" -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_LOCALE=`date -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_UTC_LOCALE=`date --utc -d @${BUILD_UTIME_USEC_TIMESTAMP}`
BUILD_DATE_LOCALE_US=`(LANG=C;date -d @${BUILD_UTIME_USEC_TIMESTAMP})`
BUILD_DATE_UTC_LOCALE_US=`(LANG=C;date --utc -d @${BUILD_UTIME_USEC_TIMESTAMP})`
BUILD_LANG=`echo $LANG`
BUILD_COMMIT=`git rev-parse HEAD`

declare -A BUILD_INFO=(
  ["APP_VERSION"]="${BUILD_APP_VERSION}"
  ["APP_NAME"]="${BUILD_APP_NAME}"
  ["APP_ID"]="${BUILD_APP_ID}"
  ["TOP_MODULE_NAME"]="${JS_TOP_MODULE_NAME}"
  ["UTIME_USEC_TIMESTAMP"]="${BUILD_UTIME_USEC_TIMESTAMP}"
  ["DATE"]="${BUILD_DATE}"
  ["DATE_MSEC"]="${BUILD_DATE_MSEC}"
  ["DATE_NO_TZ"]="${BUILD_DATE_NO_TZ}"
  ["DATE_MSEC_NO_TZ"]="${BUILD_DATE_MSEC_NO_TZ}"
  ["DATE_UTC"]="${BUILD_DATE_UTC}"
  ["DATE_UTC_MSEC"]="${BUILD_DATE_UTC_MSEC}"
  ["DATE_LOCALE"]="${BUILD_DATE_LOCALE}"
  ["DATE_UTC_LOCALE"]="${BUILD_DATE_UTC_LOCALE}"
  ["DATE_LOCALE_US"]="${BUILD_DATE_LOCALE_US}"
  ["DATE_UTC_LOCALE_US"]="${BUILD_DATE_UTC_LOCALE_US}"
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
  ["ISO8601_MSEC"]="${BUILD_ISO8601_MSEC}"
  ["ISO8601_UTC"]="${BUILD_ISO8601_UTC}"
  ["ISO8601_UTC_MSEC"]="${BUILD_ISO8601_UTC_MSEC}"
  ["LANG"]="${BUILD_LANG}"
  ["COMMIT"]="${BUILD_COMMIT}"
)

declare -A TEMPLATE_INFO=(
  ["APP_VERSION"]="${BUILD_APP_VERSION}"
  ["APP_NAME"]="${APP_NAME}"
  ["APP_ID"]="${APP_ID}"
  ["TOP_MODULE_NAME"]="${JS_TOP_MODULE_NAME}"
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

function set_template_info() {
  local fname=$1
  declare -n ref_template_info=$2
  local key=""
  local val=""
  for key in "${!ref_template_info[@]}"; do
    val=${ref_template_info[$key]}
    sed -i -e "s/@${key}@/${val}/g" "${fname}"
  done
  for key in "${!TEMPLATE_INFO[@]}"; do
    val=${TEMPLATE_INFO[$key]}
    sed -i -e "s/@${key}@/${val}/g" "${fname}"
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

function output_lvspace() {
  local _lv=${1}
  local _i=0
  local _space="  "
  for _i in `seq 1 ${_lv}`; do
    _space="${_space}  "
  done
  echo -n "${_space}"
}

function build () {
  local _dir=${1}
  local _lv=`expr 1 + ${2}`
  local dir=""
  local file=""
  local target=""
  local sdir=""
  local s2dir=""
  if [ "$PRINT_TARGET_DIR" == true ]; then
    echo -n "  " | tee -a "${BUILD_DIR}/build.log"
    output_lvspace $_lv | tee -a "${BUILD_DIR}/build.log"
    echo "build target: ${_dir}" | tee -a "${BUILD_DIR}/build.log"
  fi
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
    if [ -f "${SRC}/${_dir}/${file}" ]; then
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      echo "// module: $sdir , from: $file" >> "${TMP}/${_dir}/center.tjs"
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      cat "${SRC}/${_dir}/${file}" >> "${TMP}/${_dir}/center.tjs"
      echo "" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for dir in ${SECONDLOAD_DIRS[@]}; do
    if [ -d "${SRC}/${_dir}/${dir}" ]; then
      target=${_dir}/${dir}
      build $target $_lv
      cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for dir in `find "${SRC}/${_dir}" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
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

  for file in `find "${SRC}/${_dir}" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
    chk_loaded $FIRSTLOAD_FILES $file
    if [ $? -eq 0 ]; then
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      echo "// module: $sdir , from: $file" >> "${TMP}/${_dir}/center.tjs"
      echo "// ================================================" >> "${TMP}/${_dir}/center.tjs"
      cat "${SRC}/${_dir}/${file}" >> "${TMP}/${_dir}/center.tjs"
      echo "" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  for dir in ${LASTLOAD_DIRS[@]}; do
    if [ -d "${SRC}/${_dir}/${dir}" ]; then
      target=${_dir}/${dir}
      build $target $_lv
      cat "${TMP}/${target}/module.tjs" >> "${TMP}/${_dir}/center.tjs"
    fi
  done

  if [ $_lv -eq 1 ]; then
    cp -f "${TEMPLATE}/${MODBASETOP}" "${TMP}/${_dir}/top.tjs"
    cp -f "${TEMPLATE}/${MODBASEBOTTOM}" "${TMP}/${_dir}/bottom.tjs"
  else
    cp -f "${TEMPLATE}/${MODTOP}" "${TMP}/${_dir}/top.tjs"
    cp -f "${TEMPLATE}/${MODBOTTOM}" "${TMP}/${_dir}/bottom.tjs"
  fi
  declare -A template_info=(
    ["MODULE_NAME"]="${sdir}"
    ["MODULE_SHORT_NAME"]="${s2dir}"
  )
  if [ "$PRINT_TARGET_DIR" == true ]; then
    echo -n "  " | tee -a "${BUILD_DIR}/build.log"
    output_lvspace $_lv | tee -a "${BUILD_DIR}/build.log"
    echo "merge target: ${_dir}" | tee -a "${BUILD_DIR}/build.log"
  fi
  set_template_info "${TMP}/${_dir}/top.tjs" template_info
  set_template_info "${TMP}/${_dir}/bottom.tjs" template_info
  cat "${TMP}/${_dir}/top.tjs" "${TMP}/${_dir}/center.tjs" "${TMP}/${_dir}/bottom.tjs" > "${TMP}/${_dir}/module.tjs"
}

if [ "$PRINT_TARGET_DIR" == true ]; then
    echo "    build target: (ALL)" | tee -a "${BUILD_DIR}/build.log"
fi
touch "${TMP}/center.tjs"

cp -f ./buildsys.conf "${BUILD_DIR}/buildsys.conf"
cp -f $0 "${BUILD_DIR}/make_sh.orig"
cp -rf "${TEMPLATE}" "${BUILD_DIR}/template"

env > "${BUILD_DIR}/all.env.tmp"
cat "${BUILD_DIR}/all.env.tmp" > "${BUILD_DIR}/all.env"
rm -f "${BUILD_DIR}/all.env.tmp"

for key in "${!BUILD_INFO[@]}"; do
  val=${BUILD_INFO[$key]}
  echo "${key}=${val}" >> "${BUILD_DIR}/BUILD_INFO.env.tmp"
done
cat "${BUILD_DIR}/BUILD_INFO.env.tmp" | sort > "${BUILD_DIR}/BUILD_INFO.env"
rm -f "${BUILD_DIR}/BUILD_INFO.env.tmp"

for key in "${!TEMPLATE_INFO[@]}"; do
  val=${TEMPLATE_INFO[$key]}
  echo "${key}=${val}" >> "${BUILD_DIR}/TEMPLATE_INFO.env.tmp"
done
cat "${BUILD_DIR}/TEMPLATE_INFO.env.tmp" | sort  > "${BUILD_DIR}/TEMPLATE_INFO.env"
rm -f "${BUILD_DIR}/TEMPLATE_INFO.env.tmp"

for key in "OUTDIR" "OUTFILE" "OUT" "TMP" "SRC" "TEMPLATE" "MODBASETOP" "MODBASEBOTTOM" "MODTOP" "MODBOTTOM" "JSTOP" "JSBOTTOM"; do
  val=${!key}
  echo "${key}=${val}" >> "${BUILD_DIR}/SETTING.env.tmp"
done
cat "${BUILD_DIR}/SETTING.env.tmp" > "${BUILD_DIR}/SETTING.env"
rm -f "${BUILD_DIR}/SETTING.env.tmp"

for file in ${FIRSTLOAD_FILES[@]}; do
  if [ -f "${SRC}/${file}" ]; then
    echo "// ================================================" >> "${TMP}/center.tjs"
    echo "// source: $file" >> "${TMP}/center.tjs"
    echo "// ================================================" >> "${TMP}/center.tjs"
    cat "${SRC}/${file}" >> "${TMP}/center.tjs"
    echo "" >> "${TMP}/center.tjs"
  fi
done

for dir in ${SECONDLOAD_DIRS[@]}; do
  if [ -d "${SRC}/${dir}" ]; then
    build $dir 0
    cat "${TMP}/${dir}/module.tjs" >> "${TMP}/center.tjs"
  fi
done

for dir in `find "${SRC}/" -maxdepth 1 -type d -not -regex '.*/\..*' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
  chk_loaded $SECONDLOAD_DIRS $dir
  if [ $? -eq 0 ]; then
    build $dir 0
    cat "${TMP}/${dir}/module.tjs" >> "${TMP}/center.tjs"
  fi
done

for file in `find "${SRC}/" -maxdepth 1 -type f -regex '.+\.js' -printf '%P\n' | sed -E -e '/^[^a-zA-Z0-9]/s/^/#_/' -e '/^[0-9]/s/^/1_/' -e '/^[a-z]/s/^/2_/' -e '/^[A-Z]/s/^/3_/' | sort | sed -e 's/^._//'`; do
  chk_loaded $FIRSTLOAD_FILES $file
  if [ $? -eq 0 ]; then
    echo "// ================================================" >> "${TMP}/center.tjs"
    echo "// source: $file" >> "${TMP}/center.tjs"
    echo "// ================================================" >> "${TMP}/center.tjs"
    cat "${SRC}/${file}" >> "${TMP}/center.tjs"
    echo "" >> "${TMP}/center.tjs"
  fi
done

if [ "$PRINT_TARGET_DIR" == true ]; then
  echo "    merge target: (ALL)" | tee -a "${BUILD_DIR}/build.log"
fi

echo -n "  build...." | tee -a "${BUILD_DIR}/build.log"

touch "${TMP}/import.tjs"
for key in "${!JS_IMPORT_MODULES[@]}"; do
  val=${JS_IMPORT_MODULES[$key]}
  if [ "$JS_IMPORT_TYPE" == "import" ]; then
  echo "import ${JS_IMPORT_MODULE_PREFIX}${key} from '${val}';" >> "${TMP}/import.tjs"
  else
    echo "const ${JS_IMPORT_MODULE_PREFIX}${key} = require('${val}');" >> "${TMP}/import.tjs"
  fi
done
touch "${TMP}/importkeys.tjs"
for key in "${!JS_IMPORT_MODULES[@]}"; do
  val=${JS_IMPORT_MODULES[$key]}
  echo "" >> "${TMP}/importkeys.tjs"
  echo -n "    ${key}: ${JS_IMPORT_MODULE_PREFIX}${key}," >> "${TMP}/importkeys.tjs"
done

touch "${TMP}/export.tjs"
if [ "$JS_IS_EXPORT" == true ]; then
  echo "export default ${JS_TOP_MODULE_NAME};" >> "${TMP}/export.tjs"
fi

cp -f "${TEMPLATE}/${JSTOP}" "${TMP}/top.tjs"
cp -f "${TEMPLATE}/${JSBOTTOM}" "${TMP}/bottom.tjs"
declare -A template_info=(
  ["IMPORT_KEYS"]=`sed -z -e 's/\n/\\\\n/g' "${TMP}/importkeys.tjs"`
)
set_template_info "${TMP}/top.tjs" template_info
set_template_info "${TMP}/bottom.tjs" template_info

cat "${TMP}/import.tjs" "${TMP}/top.tjs" "${TMP}/center.tjs" "${TMP}/bottom.tjs" "${TMP}/export.tjs" > "${TMP}/main.tjs"
set_build_info "${TMP}/main.tjs"
cp -f "${TMP}/main.tjs" "${OUT}/main.js"
cp -f "${OUT}/main.js" "${OUTDIR}/${OUTFILE}"

for key in "${!COPY_DIRECTORY[@]}"; do
  val=${COPY_DIRECTORY[$key]}
  echo "  copy: ${val} -> ${OUTDIR}/${key}" | tee -a "${BUILD_DIR}/build.log"
  mkdir -p "${OUTDIR}/${key}"
  cp -rfT "${val}" "${OUTDIR}/${key}"
done



echo "done: ${OUTDIR}/${OUTFILE}" | tee -a "${BUILD_DIR}/build.log"

end_time=`date "+%s%3N"`
build_time=`expr ${end_time} - ${start_time}`
build_time_sec=`expr ${build_time} / 1000`
build_time_msec=`expr ${build_time} % 1000`
build_time_f=`printf "%d.%03d" "${build_time_sec}" "${build_time_msec}"`
build_time_d=`expr ${build_time_sec} / 3600 / 24`
if [ "$PRINT_BUILD_TIME" == true ]; then
  echo -n "  build time: " | tee -a "${BUILD_DIR}/build.log"
  echo -n `date -ud "@${build_time_f}" "+${build_time_d}:%H:%M:%S.%3N"` | tee -a "${BUILD_DIR}/build.log"
  echo " (${build_time_f} sec)" | tee -a "${BUILD_DIR}/build.log"
fi

echo "build_start_at_msec=$start_time" > "${BUILD_DIR}/build.time"
echo "build_end_at_msec=$end_time" >> "${BUILD_DIR}/build.time"
start_sec=`echo $start_time | sed -e 's/\(...\)$/.\1/'`
end_sec=`echo $end_time | sed -e 's/\(...\)$/.\1/'`
echo "build_start_at=$start_sec" >> "${BUILD_DIR}/build.time"
echo "build_end_at=$end_sec" >> "${BUILD_DIR}/build.time"
echo "build_start_date_at=`date "+%Y-%m-%d %H:%M:%S.%3N %Z" -d @${start_sec}`" >> "${BUILD_DIR}/build.time"
echo "build_end_date_at=`date "+%Y-%m-%d %H:%M:%S.%3N %Z" -d @${end_sec}`" >> "${BUILD_DIR}/build.time"
echo "build_time_msec=$build_time" >> "${BUILD_DIR}/build.time"
echo "build_time=$build_time_f" >> "${BUILD_DIR}/build.time"
echo -n "build_output=" >> "${BUILD_DIR}/build.time"
echo `date -ud "@${build_time_f}" "+${build_time_d}:%H:%M:%S.%3N"` >> "${BUILD_DIR}/build.time"

