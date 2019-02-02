/* SetList JS library */

window.onload = function () {
    var elem = {
        inputData : document.querySelector("#inputData"),
        inputSubmit : document.querySelector("#inputSubmit"),
        inputTitle : document.querySelector("#inputTitle"),
        inputSheetPath : document.querySelector("#inputSheetPath"),
        pageTitle : document.querySelector("#pageTitle"),
        outTitle : document.querySelector("#outTitle"),
        outProgram : document.querySelector("#outProgram"),
        outMore : document.querySelector("#outMore"),
    };
    var createProgram = function () {
        var rows, i, row, header, j, obj, optional, markup;
        rows = elem.inputData.value.split("\n");
        for (i = 0; i < rows.length; i += 1) {
            row = rows[i].split("\t");
            if (!header) {
                header = row;
            } else {
                if (row.length != header.length) {
                    // skip empty records
                    continue;
                }
                // assign object
                obj = {};
                for (j = 0; j < header.length; j += 1) {
                    obj[header[j].toLowerCase()] = row[j]
                }

                // skip unassigned songs indicated by sort=999
                if (obj.sort === "999") {
                    continue;
                }

                // format entry
                markup = [];
                markup.push("<div class='entry " + optional + "'>");
                markup.push("<p class='song'>" + (obj.sort ? obj.sort + ".&nbsp;" : "") + obj.song);
                if (obj.clef) {
                    markup.push(" (" + obj.clef + ")");
                }
                if (obj.instrument) {
                    insts = obj.instrument.split(";");
                    for (j = 0; j < insts.length; j += 1) {
                        insts[j] = insts[j].replace(" ","&nbsp;");
                        markup.push(" <span class='instrument'>" + insts[j] + "</span>");
                    }
                }
                optional_inline_image = null;
                if (obj.sheet) {
                    if (obj.sheet === "1") {
                        markup.push(" <span class='sheet'>Sheet</span>");
                    } else if (obj.sheet.substr(0,4) === "http") {
                        markup.push(" <span class='sheet'><a href='" + obj.sheet + "'>Sheet</a></span>");
                    } else if (obj.sheet.substr(0,6) === "inline") {
                        optional_inline_image = '<br/><img src=' + elem.inputSheetPath.value + '/' + obj.sheet + ' alt=' + obj.sheet + '/>'
                    }
                    else {
                        markup.push(" <span class='sheet'><a href='sheets/" + obj.sheet + "'>Sheet</a></span>");
                    }
                }
                markup.push("</p>");
                if (obj.remark) {
                    obj.remark = obj.remark.replace(/ *\\n */g,'<br/>');
                    markup.push("<p class='remark'>" + obj.remark + "</p>");
                }
                if (obj.chords) {
                    obj.chords = obj.chords.replace(/ *\\n */g,'<br/>');
                    markup.push("<code class='chords'>" + obj.chords + "</code>");
                }

                // add optional inline image parsed in sheet column if any
                if (optional_inline_image) {
                    markup.push(optional_inline_image)
                }
                markup.push("</p>");
                markup.push("</div>");

                // append to program
                if (obj.optional) {
                    elem.outMore.innerHTML += markup.join("");
                } else {
                    elem.outProgram.innerHTML += markup.join("");
                }
            }
        }
    };

    // autoselect input title and data
    elem.inputTitle.onfocus = elem.inputData.onfocus = function () {
        this.select()
    };
    //
    elem.inputSubmit.onclick = function () {
        // reset program if any
        elem.outProgram.innerHTML = "";
        elem.outMore.innerHTML = "";

        // set title and heading
        elem.pageTitle.innerHTML = elem.inputTitle.value;
        elem.outTitle.innerHTML = elem.inputTitle.value;

        // populate program entries
        createProgram();
    };
};
