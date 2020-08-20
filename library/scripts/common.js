/**
 * Designed by Mirsaid Patarov
 * Created on: 04.12.2017
 * Build: B1217
 */

// 2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2

(function (ctx) {
var 
  x, y, width, height,
  frame = [],
  stream = [],
  frameSize = 0, fault;

  var drawBlock = function (x, y, width, height, color) {
    ctx.clearRect(x, y, width, height);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  }

  var draw = function (i) {
    var index = 0;
    y = 40;

    var page = stream[i];
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.fillText(page, x + width / 2 - ctx.measureText(page).width / 2, 20 + 6);

    while (index < frameSize) {
      if (index < frame.length) {
        var f = frame[index];

        drawBlock(x, y, width, height, '#bbe1ed');

        if (f.use !== undefined && f.use !== 0) {
          drawBlock(x, y, width, height, '#bfc0bf');
        }

        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';                
        ctx.fillText(f.page, x + width / 2 - ctx.measureText(f.page).width / 2, y + height / 2 + 6);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, width, height);
      }

      index++;
      y += height;
    }

    if (fault) {
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText('F', x + width / 2 - ctx.measureText('F').width / 2, 260 + 6);
    }

    x += width;
  }

  var clean = function () {
    frame = [];
    x = 0, y = 40, width = 1024 / stream.length, height = 200 / frameSize;
    ctx.clearRect(0, 0, 1024, 280);
  }

  var found = function (page) {
    for(var j = 0; j < frame.length; j++) {
      if (frame[j].page === page) {
        if (frame[j].use !== undefined) {
          frame[j].use = 1;
        }
        return true;
      }
    }

    return false;
  }

  var error = function (text) {
    text = text || 'Oops! Something went wrong.';
    l2('.error').addClass('active').text(text);

    var timer = setInterval(function () {
      l2('.error').removeClass('active');
      clearInterval(timer);
    }, 3000);
  }

  l2('.frame').on('change', function () {
    frameSize = l2(this).text();

    if (!frameSize.match(/^[0-9]+$/g)) {
      stream = [];
      l2('.reference').removeClass('active').text('');
      error('Wrong size entered!');
      return;
    }

    if (frameSize < 3 || frameSize > 8) {
      stream = [];
      l2('.reference').removeClass('active').text('');
      error('Size error, min 3 max 8');
      return;
    }

    l2('.reference').addClass('active');
  });

  l2('.reference').on('change', function () {
    var text = l2(this).text();

    if (!text) {
      error('Reference empty');
    }

    stream = text.split(', ');

    for (var i = 0; i < stream.length; i++) {
      if (!stream[i].match(/^[0-9]+$/g)) {
        stream = [];
        error('Not walid reference');
        return;
      }

      stream[i] = parseInt(stream[i]);
    }
  });



  l2('.opt').on('click', function () {
    clean();

    for (var i = 0; i < stream.length; i++) {
      fault = false;
      var page = stream[i];

      if (!found(page)) {
        if (frame.length < frameSize) {
          frame.push({ page: page });
        } else {
          fault = true;
          var frameIndex = 0, streamIndex = 0;

          for (var j = 0; j < frame.length; j++) {
            var io = true;

            for (var k = i + 1; k < stream.length; k++) {
              if (frame[j].page === stream[k]) {
                if (k > streamIndex) {
                  frameIndex = j;
                  streamIndex = k;
                }

                io = false;

                break;
              }
            }

            if (io) { 
              frameIndex = j;
              break;
            }
          }

          frame[frameIndex] = { page: page }
        }
      }

      draw(i);
    }
  });

  l2('.lru').on('click', function () {
    clean();

    for (var i = 0; i < stream.length; i++) {
      fault = false;
      var page = stream[i];

      if (!found(page)) {
        if (frame.length < frameSize) {
          frame.push({ page: page });
        } else {
          fault = true;
          var frameIndex = 0, streamIndex = 0;

          for (var j = 0; j < frame.length; j++) {
            var io = true;

            for (var k = i - 1; k >= 0; k--) {
              if (frame[j].page === stream[k]) {
                if (i - k > streamIndex) {
                  frameIndex = j;
                  streamIndex = i - k;
                }

                io = false;

                break;
              }
            }

            if (io) { 
              frameIndex = j;
              break;
            }
          }

          frame[frameIndex] = { page: page }
        }
      }

      draw(i);
    }
  });

  l2('.fifo').on('click', function () {
    clean();

    var frameIndex = 0;
    for (var i = 0; i < stream.length; i++) {
      fault = false;
      var page = stream[i];

      if (!found(page)) {
        if (frame.length < frameSize) {
          frame.push({ page: page });
        } else {
          fault = true;

          frame[frameIndex++] = { page: page }
          frameIndex %= frameSize;
        }
      }

      draw(i);
    }
  });

  l2('.clock').on('click', function () {
    clean();

    var frameIndex = 0;
    for (var i = 0; i < stream.length; i++) {
      fault = false;
      var page = stream[i];

      if (!found(page)) {
        if (frame.length < frameSize) {
          frame.push({ 
            page: page,
            use: 1
          });
        } else {
          fault = true;

          while (frame[frameIndex].use != 0) {
            frame[frameIndex++].use--;
            frameIndex %= frameSize;
          }

          frame[frameIndex++] = {
            page: page,
            use: 1
          }
          frameIndex %= frameSize;
        }
      }

      draw(i);
    }
  });
})(l2('.memory').get().getContext('2d'));