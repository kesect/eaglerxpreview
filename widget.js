(function() {
    const config = window.eaglercraftXPreview;

    var chars = [1, 9, 9, 8, 8, 8, 8, 7, 9, 8, 9, 9, 8, 9, 9, 9, 8, 8, 8, 8, 9, 9, 8, 9, 8, 8, 8, 8, 8, 9, 9, 9, 4, 2, 5, 6, 6, 6, 6, 3, 5, 5, 5, 6, 2, 6, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 5, 6, 5, 6, 7, 6, 6, 6, 6, 6, 6, 6, 6, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 6, 4, 6, 6, 3, 6, 6, 6, 6, 6, 5, 6, 6, 2, 6, 5, 3, 6, 6, 6, 6, 6, 6, 6, 4, 6, 6, 6, 6, 6, 6, 5, 2, 5, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 6, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 6, 6, 3, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 2, 6, 6, 8, 9, 9, 6, 6, 6, 8, 8, 6, 8, 8, 8, 8, 8, 6, 6, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 6, 9, 9, 9, 5, 9, 9, 8, 7, 7, 8, 7, 8, 8, 8, 7, 8, 8, 7, 9, 9, 6, 7, 7, 7, 7, 7, 9, 6, 7, 8, 7, 6, 6, 9, 7, 6, 7, 1];

    function dbg_g(...args) {
        const rightnow = new Date();
        const time = rightnow.toTimeString().split(" ")[0];
        const miliseconds = rightnow.getMilliseconds().toString().padStart(3, "0");

        return ["[" + time + "+" + miliseconds + "] [EaglerXPreview]:", ...args];
    }

    function dbg(...args) {
        console.log(...dbg_g(...args));
    }

    function dbg_w(...args) {
        console.warn(...dbg_g(...args));
    }

    function dbg_e(...args) {
        throw new Error(dbg_g(...args).join(" "));
    }

    if (!config) {
        dbg_e("You must supply window.eaglercraftXPreview")
    }

    var widget = config.widget;
    var width = widget.clientWidth;
    var ratio = config.type === "relay" ? 0.09375 : 0.1484375;
    var height = Math.floor(width * ratio);

    widget.style.width = width + "px";
    widget.style.height = height + "px";
    widget.style.backgroundColor = "black";

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    widget.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    var ltgx = document.createElement("canvas");
    ltgx.width = 64;
    ltgx.height = 64;
    var aa = ltgx.getContext("2d");
    aa.imageSmoothingEnabled = false;
    var spritesheet = new Image();
    var spriteload = false;
    var serv = {
        n: config.name,
        c: false,
        p: -1,
        m1: "",
        m2: null,
        skip: false,
        on: 0,
        mx: 0
    };
    var redraw = true;
    var ctime = 0;
    var icon1 = null;
    var iconctx = null;
    var tiptext = "";
    var tipcanvas = document.createElement("canvas");
    tipcanvas.width = 64;
    tipcanvas.height = 64;
    tipcanvas.style.display = "none";
    tipcanvas.style.position = "fixed";
    tipcanvas.style.zIndex = "100";
    tipcanvas.style.pointerEvents = "none";
    document.body.appendChild(tipcanvas);

    var tipctx = tipcanvas.getContext("2d");
    tipctx.imageSmoothingEnabled = false;

    var mx = 0;
    var my = 0;
    var pagex = 0;
    var pagey = 0;
    var hover = false;
    var dtimer = 0;
    var lasttipw = 0;

    var scalex = function(t) {
        return t * width / 256;
    };
    var scaley = function(t) {
        if (config.type === "relay") {
            return t * height / 38 * (38 / 24);
        }
        return t * height / 38;
    };

    var drawimg = function(x, y, w2, h2, dx, dy, dw, dh) {
        if (spriteload) {
            ctx.drawImage(spritesheet, x + 0.05, y + 0.05, w2 - 0.1, h2 - 0.1, scalex(dx), scaley(dy), scalex(dw || w2), scaley(dh || h2));
        }
    };

    var drawchar = function(x, y, charcode, isitalic) {
        if (charcode >= chars.length) {
            charcode = 176;
        }
        if (isitalic) {
            ctx.resetTransform();
            ctx.scale(width / 256, height / 38);
            ctx.translate(x + 1.1, y);
            ctx.transform(1, 0, -0.35, 1, 0, 0);
            ctx.drawImage(spritesheet, charcode % 16 * 8, 8 * Math.floor(charcode / 16), 0.99 * chars[charcode], 7.92, 0, 0, chars[charcode], 8);
            ctx.resetTransform();
        } else {
            drawimg(charcode % 16 * 8, 8 * Math.floor(charcode / 16), chars[charcode], 8, x, y);
        }
        return chars[charcode];
    };

    var drawcolorchar = function(x, y, charcode, color, isitalic) {
        if (charcode >= chars.length) {
            charcode = 176;
        }
        if (spriteload) {
            aa.globalCompositeOperation = "source-over";
            aa.clearRect(0, 0, 8, 8);
            aa.imageSmoothingEnabled = false;
            aa.drawImage(spritesheet, charcode % 16 * 8, 8 * Math.floor(charcode / 16), 0.99 * chars[charcode], 7.92, 0, 0, chars[charcode], 8);
            aa.globalCompositeOperation = "source-in";
            aa.fillStyle = color;
            aa.fillRect(0, 0, chars[charcode], 8);
            if (isitalic) {
                ctx.resetTransform();
                ctx.scale(width / 256, height / 38);
                ctx.translate(x + 1.1, y);
                ctx.transform(1, 0, -0.35, 1, 0, 0);
                ctx.drawImage(ltgx, 0, 0, 0.99 * chars[charcode], 7.92, 0, 0, chars[charcode], 8);
                ctx.resetTransform();
            } else {
                ctx.drawImage(ltgx, 0, 0, 0.99 * chars[charcode], 7.92, scalex(x), scaley(y), scalex(chars[charcode]), scaley(8));
            }
        }
        return chars[charcode];
    };

    var drawline = function(x, y, w2, color) {
        ctx.fillStyle = color;
        ctx.fillRect(scalex(x), scaley(y), scalex(w2 + 0.02), scaley(1));
    };

    var GETRGB = function(r, g, b) {
        return "rgba(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ",1.0)";
    };

    var strwidth = function(s, stylechar) {
        if (stylechar) {
            stylechar = stylechar.charCodeAt(0);
        } else {
            stylechar = 167;
        }
        var totalwidth = 0;
        for (var j = 0; j < s.length; ++j) {
            var charcode = s.charCodeAt(j);
            if (charcode === stylechar) {
                j += 2;
            } else {
                totalwidth = charcode < chars.length ? totalwidth + chars[charcode] : totalwidth + 6;
            }
        }
        return totalwidth;
    };

    var drawstr = function(x, y, str, r, g, b, shadow, prng, stylechar) {
        var origstylechar = stylechar;

        if (stylechar) {
            stylechar = stylechar.charCodeAt(0);
        } else {
            stylechar = 167;
        }

        var origx = x;
        var origy = y;

        if (shadow) {
            x++;
            y++;
        }

        prng = prng || 3492589035;

        var cflag = false;
        var cr = r;
        var cg = g;
        var cb = b;
        var fobfus = false;
        var fbold = false;
        var fstrike = false;
        var funder = false;
        var fitalic = false;

        for (var i = 0; i < str.length; ++i) {
            var charcode = str.charCodeAt(i);
            if (charcode === stylechar) {
                cflag = true;
            } else if (cflag) {
                if (charcode === 48) {
                    cr = 0;
                    cg = 0;
                    cb = 0;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 0
                else if (charcode === 49) {
                    cr = 0;
                    cg = 0;
                    cb = 170;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 1
                else if (charcode === 50) {
                    cr = 0;
                    cg = 170;
                    cb = 0;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 2
                else if (charcode === 51) {
                    cr = 0;
                    cg = 170;
                    cb = 170;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 3
                else if (charcode === 52) {
                    cr = 170;
                    cg = 0;
                    cb = 0;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 4
                else if (charcode === 53) {
                    cr = 170;
                    cg = 0;
                    cb = 170;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 5
                else if (charcode === 54) {
                    cr = 255;
                    cg = 170;
                    cb = 0;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 6
                else if (charcode === 55) {
                    cr = 170;
                    cg = 170;
                    cb = 170;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 7
                else if (charcode === 56) {
                    cr = 85;
                    cg = 85;
                    cb = 85;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 8
                else if (charcode === 57) {
                    cr = 85;
                    cg = 85;
                    cb = 255;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // 9
                else if (charcode === 97) {
                    cr = 85;
                    cg = 255;
                    cb = 85;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // a
                else if (charcode === 98) {
                    cr = 85;
                    cg = 255;
                    cb = 255;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // b
                else if (charcode === 99) {
                    cr = 255;
                    cg = 85;
                    cb = 85;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // c
                else if (charcode === 100) {
                    cr = 255;
                    cg = 85;
                    cb = 255;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // d
                else if (charcode === 101) {
                    cr = 255;
                    cg = 255;
                    cb = 85;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // e
                else if (charcode === 102) {
                    cr = 255;
                    cg = 255;
                    cb = 255;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // f
                else if (charcode === 107) {
                    cflag = false;
                    fobfus = true;
                } // k
                else if (charcode === 108) {
                    cflag = false;
                    fbold = true;
                } // l
                else if (charcode === 109) {
                    cflag = false;
                    fstrike = true;
                } // m
                else if (charcode === 110) {
                    cflag = false;
                    funder = true;
                } // n
                else if (charcode === 111) {
                    cflag = false;
                    fitalic = true;
                } // o
                else if (charcode === 114) {
                    cr = r;
                    cg = g;
                    cb = b;
                    cflag = false;
                    fobfus = false;
                    fbold = false;
                    fstrike = false;
                    funder = false;
                    fitalic = false;
                } // r
                else {
                    cflag = false;
                }
            } else {
                if (fobfus) {
                    redraw = true;
                    var wc = 6;
                    if (charcode < chars.length) {
                        wc = chars[charcode];
                    }
                    var at = 0;
                    var newrandchar;
                    do {
                        var nr = prng += 1831565813;
                        nr = Math.imul(nr ^ nr >>> 15, 1 | nr);
                        nr ^= nr + Math.imul(nr ^ nr >>> 7, 61 | nr);
                        nr = ((nr ^ nr >>> 14) >>> 0) / 429496 & 255;
                        newrandchar = nr;
                    } while ((newrandchar === charcode || chars[newrandchar] !== wc) && 1000 > ++at);
                    charcode = newrandchar;
                }
                if (shadow) {
                    var color = GETRGB(cr * 0.247, cg * 0.247, cb * 0.247);
                    var sx = x;
                    if (fbold) drawcolorchar(x + 1, y, charcode, color, fitalic);
                    var charw = drawcolorchar(x, y, charcode, color, fitalic);
                    x += charw;
                    if (fbold) {
                        x++;
                        charw++;
                    }
                    if (fstrike) drawline(sx, y + 4, charw, color);
                    if (funder) drawline(sx, y + 8, charw, color);
                } else if (cr >= 250 && cg >= 250 && cb >= 250) {
                    var sx = x;
                    if (fbold) drawchar(x + 1, y, charcode, fitalic);
                    var charw = drawchar(x, y, charcode, fitalic);
                    x += charw;
                    if (fbold) {
                        x++;
                        charw++;
                    }
                    if (fstrike) drawline(sx, y + 4, charw, "#FFFFFF");
                    if (funder) drawline(sx, y + 8, charw, "#FFFFFF");
                } else {
                    var color = GETRGB(cr, cg, cb);
                    var sx = x;
                    if (fbold) drawcolorchar(x + 1, y, charcode, color, fitalic);
                    var charw = drawcolorchar(x, y, charcode, color, fitalic);
                    x += charw;
                    if (fbold) {
                        x++;
                        charw++;
                    }
                    if (fstrike) drawline(sx, y + 4, charw, color);
                    if (funder) drawline(sx, y + 8, charw, color);
                }
                if (x > 250) {
                    break;
                }
            }
        }

        if (shadow) {
            drawstr(origx, origy, str, r, g, b, false, prng, origstylechar);
        }
    };

    function render() {
        var x = 38;
        if (config.type === "relay") {
            x = 25;
        }
        if (redraw || (hover && 0 === ++dtimer % 2) || width !== widget.clientWidth) {
            redraw = false;

            var tiplines = [];
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#808080";
            ctx.lineWidth = scalex(0.8);
            ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);

            if (config.type === "server") {
                if (icon1) {
                    ctx.drawImage(icon1, 0, 0, 64, 64, scalex(2), scaley(2), scalex(34), scaley(34));
                } else {
                    drawimg(128, 0, 64, 64, 2, 2, 34, 34);
                }
            }

            var now = Date.now();
            var showaddr = false;
            if (config.type === "relay") {
                drawstr(x, 4, serv.n, 255, 255, 255, 1, now);
            } else {
                drawstr(x, 4, serv.n, 255, 255, 255, 0, now);
            }
            if (config.type === "relay") {
                if (!config.hideAddr) {
                    drawstr(x, 14, config.addr, 153, 153, 153, 1, now);
                }
            } else if (serv.p >= 0) {
                if (serv.m1.length > 0) {
                    drawstr(x, 15, serv.m1, 255, 255, 255, 0, now);
                }
                if (serv.m2 !== null) {
                    drawstr(x, 27, serv.m2, 255, 255, 255, 0, now);
                } else {
                    showaddr = true;
                    if (!config.hideAddr) {
                        drawstr(x, 27, config.addr, 48, 48, 48, 0, now);
                    }
                }
            } else {
                if (now - ctime < 5000) {
                    redraw = true;
                    drawstr(x, 15, "", 128, 128, 128, 0, now);
                } else {
                    drawstr(x, 15, "", 96, 96, 96, 0, now);
                }
                showaddr = true;
                if (!config.hideAddr) {
                    drawstr(x, 27, config.addr, 48, 48, 48, 0, now);
                }
            }

            var fetching = ["Pinging..."]
            if (config.type === "relay") {
                fetching[0] = "Polling...";
            }

            var hoverping = hover && mx >= 240 && mx <= 256 && my >= 1 && my <= 11;
            if (serv.p >= 0) {
                if (hoverping) {
                    tiplines = [serv.p + "ms"];
                }

                var pcount = ""
                if (!serv.skip) {
                    pcount = serv.on + "/" + serv.mx;
                }
                drawstr(241 - strwidth(pcount), 3, pcount, 128, 128, 128, 0);

                var pingy = 80;
                if (serv.p < 150) {
                    pingy += 8 * 0;
                } else if (serv.p < 300) {
                    pingy += 8 * 1;
                } else if (serv.p < 600) {
                    pingy += 8 * 2;
                } else if (serv.p < 1000) {
                    pingy += 8 * 3;
                } else {
                    pingy += 8 * 4;
                }
                drawimg(128, pingy, 10, 7, 243, 3);
            } else if (now - ctime < 5000) {
                redraw = true;
                if (hoverping) {
                    tiplines = fetching;
                }
                drawimg(138, 80 + 8 * Math.abs(Math.floor(now / 100) % 8 - 4), 10, 7, 243, 3);
            } else {
                if (hoverping) {
                    tiplines = ["(no connection)"];
                }
                drawimg(128, 120, 10, 7, 243, 3);
            }

            if (serv.p >= 0 && serv.c) {
                drawimg(144, 64, 16, 16, 243, 25, 10, 10);
                if (hover && mx >= 239 && mx <= 256 && my >= 22 && my <= 36) {
                    tiplines = ["Server is cracked"];
                }
            }

            if (tiplines && hover && tiplines.length !== 0) {
                updatetip(tiplines);
            } else {
                tipcanvas.style.display = "none";
            }
        }
        requestAnimationFrame(render)
    }

    var updatetip = function(lines) {
        var s = lines.join();
        if (s !== tiptext || lasttipw !== width) {
            var maxw = 0;
            for (var i = 0; i < lines.length; ++i) {
                maxw = Math.max(maxw, strwidth(lines[i]));
            }
            var tipw = (lines.length === 1) ? Math.ceil(0.9 * maxw) + 6 : maxw + 6;
            var tiph = (lines.length === 1) ? 9 * lines.length + 4 : 8 * lines.length + 6;

            tipcanvas.width = scalex(tipw);
            tipcanvas.height = scaley(tiph);

            var origctx = ctx;
            ctx = tipctx;
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, tipcanvas.width, tipcanvas.height);

            var linewidth = scalex(1);
            ctx.fillStyle = "#110210";
            ctx.beginPath();
            ctx.roundRect(0, 0, tipcanvas.width, tipcanvas.height, scalex(0.5));
            ctx.fill();

            var gradient = ctx.createLinearGradient(0, linewidth, 0, tipcanvas.height - linewidth);
            gradient.addColorStop(0, "#25015b");
            gradient.addColorStop(1, "#180132");
            ctx.strokeStyle = gradient;
            ctx.lineWidth = linewidth;
            ctx.beginPath();
            ctx.roundRect(linewidth, linewidth, tipcanvas.width - 2 * linewidth, tipcanvas.height - 2 * linewidth, scalex(0.5));
            ctx.stroke();

            ctx.fillStyle = "#110110";
            ctx.beginPath();
            ctx.roundRect(2 * linewidth, 2 * linewidth, tipcanvas.width - 4 * linewidth, tipcanvas.height - 4 * linewidth, scalex(0.5));
            ctx.fill();

            ctx.save();
            ctx.scale(0.9, 0.9);
            for (i = 0; i < lines.length; ++i) {
                drawstr(3 / 0.9, 2 / 0.9 + 9 * i / 0.9, lines[i], 256, 256, 256, true);
            }
            ctx.restore();

            ctx = origctx;
            tiptext = s;
            lasttipw = width;
        }

        if (hover) {
            tipcanvas.style.display = "block";
            var left = pagex + scalex(4);
            var top = pagey - scaley(9);

            if (pagex + tipcanvas.width + 2 > window.innerWidth) {
                left = window.innerWidth - tipcanvas.width - 2;
            }
            if (pagey + tipcanvas.height + 2 > window.innerHeight) {
                top = window.innerHeight - tipcanvas.height - 2;
                if (top < 0) {
                    top = 0;
                }
            }
            tipcanvas.style.left = left + "px";
            tipcanvas.style.top = top + "px";
        } else {
            tipcanvas.style.display = "none";
        }
    };

    var mousemove = function(e) {
        hover = true;
        mx = e.offsetX / width * 256;
        my = e.offsetY / height * 38;
        pagex = e.clientX;
        pagey = e.clientY;
        redraw = true;
    };

    canvas.addEventListener("mouseover", mousemove);
    canvas.addEventListener("mousemove", mousemove);

    canvas.addEventListener("mouseout", function() {
        hover = false;
        tipcanvas.style.display = "none";
        redraw = true;
    });

    spritesheet.addEventListener("load", function() {
        spriteload = true;
        dbg("Spritesheet loaded with size", width, "x", height);
        requestAnimationFrame(render);
    });
    spritesheet.src = config.spritesheet;

    serv = {
        n: config.name,
        c: false,
        p: -1,
        m1: "",
        m2: null,
        skip: false,
        on: 0,
        mx: 0
    };

    redraw = true;
    ctime = Date.now();

    dbg("Connecting to " + config.addr)
    var ws = new WebSocket(config.addr);
    ws.binaryType = "arraybuffer";

    ws.onopen = function() {
        dbg("Connected to " + config.addr)
        if (config.type === "server") {
            ws.send("Accept: MOTD");
            dbg('Sent "Accept: MOTD"')
        } else if (config.type === "relay") {
            ws.send(new Uint8Array([0, 3, 1, 0]));
            dbg('Sent', new Uint8Array([0, 3, 1, 0]))
        }
    };

    ws.onmessage = function(e) {
        if (e.data) {
            if ((function() {
                    try {
                        JSON.parse(e.data);
                        return true
                    } catch {
                        return
                    }
                })() && config.type === "server") {
                try {
                    var d = JSON.parse(e.data);
                    dbg("Received server info", d)
                    if (d.type === "motd") {
                        redraw = true;
                        dbg("Timestamp:", Math.floor(e.timeStamp) + "ms")
                        if (serv.p === -1) {
                            serv.p = Math.floor(e.timeStamp);
                        }
                        dbg("Server name:", d.name)
                        dbg("Server brand:", d.brand)
                        serv.n = config.force ? config.name : d.name;
                        serv.c = d.cracked;
                        if (serv.c) {
                            dbg_w("Server is cracked")
                        }
                        var m = d.data.motd;
                        if (m && m.length > 0) {
                            serv.m1 = m[0];
                            if (m.length > 1) {
                                serv.m2 = m[1];
                            }
                        }
                        serv.on = d.data.online;
                        serv.mx = d.data.max;
                    } else if (d.type === "blocked") {
                        dbg_w("Server has blocked you temporarily, retrying in 5 seconds")
                        setTimeout(function() {
                            dbg_w("Server has blocked you temporarily, retrying in 4 seconds")
                            setTimeout(function() {
                                dbg_w("Server has blocked you temporarily, retrying in 3 seconds")
                                setTimeout(function() {
                                    dbg_w("Server has blocked you temporarily, retrying in 2 seconds")
                                    setTimeout(function() {
                                        dbg_w("Server has blocked you temporarily, retrying in 1 second")
                                        setTimeout(function() {
                                            window.location.reload()
                                        }, 1000)
                                    }, 1000)
                                }, 1000)
                            }, 1000)
                        }, 1000)
                    }
                } catch (x) {
                    dbg_w("Malformed server info packet", JSON.parse(e.data))
                }
            } else if ((d = new Uint8Array(e.data)).length === 16384 && config.type === "server") {
                dbg("Received server icon", new Uint8Array(e.data))
                if (!icon1) {
                    icon1 = document.createElement("canvas");
                    icon1.width = 64;
                    icon1.height = 64;
                    iconctx = icon1.getContext("2d");
                }
                var imgdata = iconctx.createImageData(64, 64);
                for (var i = 0; i < 16384; ++i) {
                    imgdata.data[i] = d[i];
                }
                iconctx.putImageData(imgdata, 0, 0);
                redraw = true;
            } else if ((d = new Uint8Array(e.data))[0] === 0x69 && config.type === "relay") {
                var d = new Uint8Array(e.data)
                dbg("Received relay info", d)
                dbg("Timestamp:", Math.floor(e.timeStamp) + "ms")
                serv.skip = true
                if (serv.p === -1) {
                    serv.p = Math.floor(e.timeStamp);
                }
                if (d[2] !== 0) {
                    var comment = new TextDecoder('iso-8859-1').decode(d.slice(3, 3 + d[2]));
                    serv.n = config.force ? config.name : comment;
                    dbg("Relay server comment:", comment)
                    dbg("Relay server brand:", new TextDecoder().decode(d.slice(3 + d[2] + 1, 3 + d[2] + 1 + d[3 + d[2]])))
                } else {
                    dbg("No relay server comment")
                }
            } else {
                ws.close();
                var binary = new Uint8Array(e.data)
                if (typeof e.data === "object" && binary.length !== 0) {
                    dbg_w("Received unknown packet", binary)
                } else {
                    dbg_w("Received unknown packet", '"' + e.data + '"')
                }
            }
        }
    };

    ws.onclose = function() {
        ctime = 0;
        redraw = true;
        dbg("Connection closed")
    };

    ws.onerror = function() {
        ws.close();
        ctime = 0;
        redraw = true;
    };
})();

