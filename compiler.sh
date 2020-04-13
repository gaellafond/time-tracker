#!/bin/bash

function substitute_url() {
  # Substitute script tags
  #   <script src="..."></script>
  if [[ "$1" =~ ^[[:space:]]*\<script\ .*src=\"(.*)\".*\>[[:space:]]*\</script\>$ ]]; then
    echo "<script>"
    echo "// FILE: ${BASH_REMATCH[1]}"
    cat "${BASH_REMATCH[1]}"
    echo "</script>"

  # Substitute CSS tags
  #   <link type="text/css" href="..." \> OR <link href="..." type="text/css" \>
  elif [[ "$1" =~ ^[[:space:]]*\<link\ .*type=\"text/css\".*href=\"(.*)\".*/\>$ || "$1" =~ ^[[:space:]]*\<link\ .*href=\"(.*)\".*type=\"text/css\".*/\>$ ]]; then
    echo "<style>"
    echo "<!-- FILE: ${BASH_REMATCH[1]} -->"
    cat "${BASH_REMATCH[1]}"
    echo "</style>"

  else
    echo "$1"
  fi
}

mkdir -p target
rm -f target/time-tracker.html

while IFS= read -r line; do
  substitute_url "$line" >> target/time-tracker.html
done < "index.html"


# See:
#     https://stackoverflow.com/questions/6790631/use-the-contents-of-a-file-to-replace-a-string-using-sed
#sed -i -e "/<script src=\"\(js\/jquery_3-4-1\/jquery-3.4.1.min.js\)\"><\/script>/{r TODO.txt" -e "d}" target/time-tracker.html
#sed -i -e "/<script src=\"\(js\/jquery_3-4-1\/jquery-3.4.1.min.js\)\"><\/script>/{r \1" -e "d}" target/time-tracker.html
