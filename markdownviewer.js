(function(document) {

	if (document.doctype) return;

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.extension.getURL('markdownviewer.css');
	document.head.appendChild(link);

	link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.extension.getURL('prettify.css');
	document.head.appendChild(link);
	document.body.innerHTML =
	'<div id="markdown-container"></div>'+
	'<div id="markdown-outline"></div>'+
	'<div id="markdown-buttons-container">'+
		'<div id="markdown-backTop" onclick="window.scrollTo(0,0);"></div>'+
		'<div id="markdown-raw" onclick="window.location=\'view-source:\' + window.location.href;"></div>'+
		'<div id="markdown-bottom" onclick="window.scrollTo(0, document.body.scrollHeight);"></div>'+
	'</div>';

	var lastText = null;

	function updateMarkdown(text) {
		if (text !== lastText) {
			marked.setOptions({
				gfm: true,
				pedantic: false,
				sanitize: false
			});
			lastText = text;
			document.getElementById('markdown-container').innerHTML = marked(lastText);
			prettyPrint();
			updateOutline();
		}
	}

	function updateOutline() {
		var arrAllHeader = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
		var arrOutline = ['<ul>'];
		var header, headerText;
		var id = 0;
		var level = 0,
			lastLevel = 1;
		var levelCount = 0;
		for (var i = 0, c = arrAllHeader.length; i < c; i++) {
			header = arrAllHeader[i];
			headerText = header.innerText;

			header.setAttribute('id', id);

			level = header.tagName.match(/^h(\d)$/i)[1];
			levelCount = level - lastLevel;

			if (levelCount > 0) {
				for (var j = 0; j < levelCount; j++) {
					arrOutline.push('<ul>');
				}
			} else if (levelCount < 0) {
				levelCount *= -1;

				for (var j = 0; j < levelCount; j++) {
					arrOutline.push('</ul>');
				}
			}

			arrOutline.push('<li>');
			arrOutline.push('<a href="#' + id + '">' + headerText + '</a>');
			arrOutline.push('</li>');
			lastLevel = level;
			id++;
		}
		arrOutline.push('</ul>');

		var outline = document.getElementById('markdown-outline');

		if(arrOutline.length > 2){
			outline.innerHTML = arrOutline.join('');
		} else {
			outline.style.display = 'none';
		}
	}

	var xmlhttp = new XMLHttpRequest();
	var fileurl = location.href,
		bLocalFile = /^file:\/\//i.test(fileurl);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status != 404) {
			updateMarkdown(xmlhttp.responseText);
		}
	};

	function checkUpdate() {
		xmlhttp.abort();
		xmlhttp.open("GET", fileurl + '?rnd=' + new Date().getTime(), true);
		xmlhttp.send(null);
		if (bLocalFile) setTimeout(checkUpdate, 500);
	}

	checkUpdate();

}(document));
