// DOM and canvas
var link = document.getElementsByTagName('footer')[0];
var copyrightYear = document.getElementById('text');
var canvas = document.getElementById('matrix');
var ctx = canvas.getContext('2d');
// constants
var myName = 'LEO YEUNG';
var caption = 'YET ANOTHER DEVELOPER';
var chinese = '的是不我一有大在人了中到資要可以這個你會好為上來就學交也用能如文時沒說他看提那問生過下請天們所多麼小想得之還電出工對都機自後子而訊站去心只家知國台很信成章何同道地發法無然但嗎當於本現年前真最和新因果定'.split(''); // top 100 common chinese character //source: https://www.plecoforums.com/threads/the-5000-most-used-chinese-characters-finished.1674/
var refresh = 50;
var fadeFactor = 0.03;
var fadeFactorText = 1.0;
// variable for clearing listeners when resizing
var loopListener;
// get year for copyright text
copyrightYear.innerText = new Date().getFullYear();

function visible () {
  link.classList.add('visible');
}

function hide () {
  link.classList.remove('visible');
}

function ran (x, y) {
  var num = x || -200;
  var min = y || 0;
  return Math.floor(Math.random() * num + min);
}

function textWidth (str, totalStream, fontSize) {
  var centerAlign = Math.round(totalStream / 2) - Math.floor(str.length / 2);
  return (centerAlign - 1) * fontSize;
}; // align the name with streams

function countText (str, coX, obj, fontSize) {
  str.split('').forEach(function (c, i) {
    var temp = {};
    obj[coX + i * fontSize] = temp;
    temp.char = halfToFull(c);
    temp.printed = c === ' ';
  });
}

function printText (obj, x, y, fontSize) {
  var i = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key].printed) { ctx.fillText(obj[key].char, x + i * fontSize, y); }
    }
    i++;
  }
}
function halfToFull (c) {
  return c.charCodeAt() === 0x20 ? String.fromCharCode(0x20) : String.fromCharCode(c.charCodeAt() + 0xFF21 - 65);
}

function symbolPicker (x) {
  switch (true) {
    case (x < 4): // Japanese Katakana //Wanna have more of these as the original matrix streams are mainly comprised of these.
      return String.fromCharCode(ran(90, 0x30A1));
    case (x === 4): // Chinese
      return chinese[ran(100)];
    case (x === 5): // Numbers
      return String.fromCharCode(ran(10, 0xFF10));
    default:
      return String.fromCharCode(ran(26, 0xFF21)); // full form Cap alphabet
  }
}

function drawType1 (width, height, fontStyle, streams, nameHeight, nameText, captionHeight, captionText, nameFontStyle, nameWidth, captionWidth, fontSize, totalStream) { // type 1
  var numOfStreams = totalStream >= 31;
  ctx.fillStyle = 'rgba(0,0,0,' + fadeFactor + ')';// 'there is no spoon -- and there is no streams as well'
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 255, 70,' + fadeFactorText + ')';// for green text
  ctx.font = fontStyle;
  streams.forEach(function (symbol) {
    if (symbol.y === nameHeight && nameText[symbol.x] && nameText[symbol.x].char !== ' ') {
      nameText[symbol.x].printed = true;
      symbol.print(' ');
    } else if (numOfStreams && symbol.y === captionHeight && captionText[symbol.x] && captionText[symbol.x].char !== ' ') {
      captionText[symbol.x].printed = true;
      symbol.print(' ');
    } else { symbol.print(); }
  });
  ctx.fillStyle = 'rgba(255,255,255,1)';// 'for the name'
  ctx.font = nameFontStyle;
  printText(nameText, nameWidth, nameHeight, fontSize);
  numOfStreams && printText(captionText, captionWidth, captionHeight, fontSize);
  if (!link.classList.contains('visible') && // reduce redundant function calling and checking
    ((!numOfStreams && checkFinish(nameText)) || // in case of smaller screen size and only the name should be printed
    (numOfStreams && checkFinish(nameText) && checkFinish(captionText)))) visible();// for normal case
}

function Character (x, y, height, fontSize) {
  this.x = x;
  this.y = y;

  this.value = symbolPicker(ran(7));

  this.rain = function () {
    this.y = (this.y >= height) ? ran() * fontSize : this.y += fontSize;
  };

  this.ranChar = function () {
    this.value = symbolPicker(ran(7));
  };

  this.print = function (c) { // for type 1 
    this.value = c || this.value;
    ctx.fillText(this.value, this.x, this.y);
    this.rain();
    this.ranChar();
  };
}

function createRainType1 (totalStream, captionWidth, fontSize, streams, height) {
  var x = 0;
  for (var i = 0; i < totalStream; i++) {
    var y = x <= captionWidth + 21 * fontSize && x >= captionWidth ? ran(-70) * fontSize : ran() * fontSize;
    var symbol = new Character(x, y, height, fontSize);
    x += fontSize;
    streams.push(symbol);
  }
}

function checkFinish (obj) {
  var count = 0;
  for (var key in obj) {
    if (obj[key].printed) { count++; }
  }
  return count === Object.keys(obj).length;
}

function init () {
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;
  var totalStream = Math.floor(width / 22) % 2 === 0 ? Math.floor(width / 22) + 1 : Math.floor(width / 22);
  var fontSize = Math.round(width / totalStream);
  var nameHeight = Math.round(height / 2 / fontSize) * fontSize; // alignment
  var nameWidth = textWidth(myName, totalStream, fontSize);
  var nameText = {};
  var captionHeight = nameHeight + fontSize;
  var captionWidth = textWidth(caption, totalStream, fontSize);
  var captionText = {};
  var fontStyle = 'bold ' + fontSize + 'px Courier';
  var nameFontStyle = 'bold ' + fontSize + 'px Morpheus Courier';
  var streams = [];

  countText(myName, nameWidth, nameText, fontSize);
  countText(caption, captionWidth, captionText, fontSize);
  createRainType1(totalStream, captionWidth, fontSize, streams, height);
  loopListener = setInterval(function () {
    drawType1(width, height, fontStyle, streams, nameHeight, nameText, captionHeight, captionText, nameFontStyle, nameWidth, captionWidth, fontSize, totalStream);
  }, refresh);
}

init();

window.addEventListener('resize', function () { // redraw the whole thing -- let the awesome animation run again!
  hide();
  // reset everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearInterval(loopListener);
  setTimeout(init, 50); // as the resize triggers at the beginning of the action, some of the browsers like chrome and FF will return old value of the dimensions
}); // do not need clearTimeout as we want the init() to return and it should be
// setting 0 is good enough to get the correct width but not the height, and 50 milisec is good enough
