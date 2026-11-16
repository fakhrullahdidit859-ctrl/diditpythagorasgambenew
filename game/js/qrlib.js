/* Pembuat kode QR (offline) — QRCode for JavaScript © Kazuhiko Arase, lisensi MIT (http://www.opensource.org/licenses/mit-license.php).
   Dibungkus agar bisa jalan di browser dan Node. Pemakaian:  QRMake.svg("https://...", {size:240})  /  QRMake.matrix("teks") */
(function (root) {
  var defs = {}, cache = {};
  function req(n) { n = n.replace('./', ''); if (!cache[n]) { var m = { exports: {} }; defs[n](m, m.exports, req); cache[n] = m.exports; } return cache[n]; }
  defs['QRMode'] = function (module, exports, require) {
module.exports = {
    MODE_NUMBER :       1 << 0,
    MODE_ALPHA_NUM :    1 << 1,
    MODE_8BIT_BYTE :    1 << 2,
    MODE_KANJI :        1 << 3
};

  };
  defs['QRErrorCorrectLevel'] = function (module, exports, require) {
module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};


  };
  defs['QRMaskPattern'] = function (module, exports, require) {
module.exports = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

  };
  defs['QRMath'] = function (module, exports, require) {
var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

module.exports = QRMath;

  };
  defs['QRPolynomial'] = function (module, exports, require) {
var QRMath = require('./QRMath');

function QRPolynomial(num, shift) {
	if (num.length === undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] === 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var x = 0; x < e.getLength(); x++) {
			num[x] ^= QRMath.gexp(QRMath.glog(e.get(x) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

module.exports = QRPolynomial;

  };
  defs['QRRSBlock'] = function (module, exports, require) {
var QRErrorCorrectLevel = require('./QRErrorCorrectLevel');

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	
	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4		
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	
	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	
	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	
	// 7		
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	
	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	
	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	
	// 10		
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock === undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = [];
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
};

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
};

module.exports = QRRSBlock;

  };
  defs['QRBitBuffer'] = function (module, exports, require) {
function QRBitBuffer() {
	this.buffer = [];
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

module.exports = QRBitBuffer;

  };
  defs['QR8bitByte'] = function (module, exports, require) {
var QRMode = require('./QRMode');

function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
}

QR8bitByte.prototype = {

	getLength : function() {
		return this.data.length;
	},
	
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			// not JIS ...
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};

module.exports = QR8bitByte;

  };
  defs['QRUtil'] = function (module, exports, require) {
var QRMode = require('./QRMode');
var QRPolynomial = require('./QRPolynomial');
var QRMath = require('./QRMath');
var QRMaskPattern = require('./QRMaskPattern');

var QRUtil = {

    PATTERN_POSITION_TABLE : [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],        
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)    | (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) );    
        }
        return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) );    
        }
        return (data << 12) | d;
    },

    getBCHDigit : function(data) {

        var digit = 0;

        while (data !== 0) {
            digit++;
            data >>>= 1;
        }

        return digit;
    },

    getPatternPosition : function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
        
        switch (maskPattern) {
            
        case QRMaskPattern.PATTERN000 : return (i + j) % 2 === 0;
        case QRMaskPattern.PATTERN001 : return i % 2 === 0;
        case QRMaskPattern.PATTERN010 : return j % 3 === 0;
        case QRMaskPattern.PATTERN011 : return (i + j) % 3 === 0;
        case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 === 0;
        case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 === 0;
        case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 === 0;
        case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 === 0;

        default :
            throw new Error("bad maskPattern:" + maskPattern);
        }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

        var a = new QRPolynomial([1], 0);

        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
        }

        return a;
    },

    getLengthInBits : function(mode, type) {

        if (1 <= type && type < 10) {

            // 1 - 9

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 10;
            case QRMode.MODE_ALPHA_NUM  : return 9;
            case QRMode.MODE_8BIT_BYTE  : return 8;
            case QRMode.MODE_KANJI      : return 8;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 27) {

            // 10 - 26

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 12;
            case QRMode.MODE_ALPHA_NUM  : return 11;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 10;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 41) {

            // 27 - 40

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 14;
            case QRMode.MODE_ALPHA_NUM  : return 13;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 12;
            default :
                throw new Error("mode:" + mode);
            }

        } else {
            throw new Error("type:" + type);
        }
    },

    getLostPoint : function(qrCode) {
        
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0; 
        var col = 0;

        
        // LEVEL1
        
        for (row = 0; row < moduleCount; row++) {

            for (col = 0; col < moduleCount; col++) {

                var sameCount = 0;
                var dark = qrCode.isDark(row, col);

                for (var r = -1; r <= 1; r++) {

                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (var c = -1; c <= 1; c++) {

                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrCode.isDark(row + r, col + c) ) {
                            sameCount++;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }

        // LEVEL2

        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row,     col    ) ) count++;
                if (qrCode.isDark(row + 1, col    ) ) count++;
                if (qrCode.isDark(row,     col + 1) ) count++;
                if (qrCode.isDark(row + 1, col + 1) ) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        // LEVEL3

        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && 
                        !qrCode.isDark(row, col + 1) && 
                         qrCode.isDark(row, col + 2) && 
                         qrCode.isDark(row, col + 3) && 
                         qrCode.isDark(row, col + 4) && 
                        !qrCode.isDark(row, col + 5) && 
                         qrCode.isDark(row, col + 6) ) {
                    lostPoint += 40;
                }
            }
        }

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                        !qrCode.isDark(row + 1, col) &&
                         qrCode.isDark(row + 2, col) &&
                         qrCode.isDark(row + 3, col) &&
                         qrCode.isDark(row + 4, col) &&
                        !qrCode.isDark(row + 5, col) &&
                         qrCode.isDark(row + 6, col) ) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        
        var darkCount = 0;

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col) ) {
                    darkCount++;
                }
            }
        }
        
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;       
    }

};

module.exports = QRUtil;

  };
  defs['index'] = function (module, exports, require) {
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of 
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
// Modified to work in node for this project (and some refactoring)
//---------------------------------------------------------------------

var QR8bitByte = require('./QR8bitByte');
var QRUtil = require('./QRUtil');
var QRPolynomial = require('./QRPolynomial');
var QRRSBlock = require('./QRRSBlock');
var QRBitBuffer = require('./QRBitBuffer');

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);
		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		// Calculate automatically typeNumber if provided is < 1
		if (this.typeNumber < 1 ){
			var typeNumber = 1;
			for (typeNumber = 1; typeNumber < 40; typeNumber++) {
				var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);

				var buffer = new QRBitBuffer();
				var totalDataCount = 0;
				for (var i = 0; i < rsBlocks.length; i++) {
					totalDataCount += rsBlocks[i].dataCount;
				}

				for (var x = 0; x < this.dataList.length; x++) {
					var data = this.dataList[x];
					buffer.put(data.mode, 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
					data.write(buffer);
				}
				if (buffer.getLengthInBits() <= totalDataCount * 8)
					break;
			}
			this.typeNumber = typeNumber;
		}
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new Array(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache === null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c === 0 || c === 6) ) || 
                     (0 <= c && c <= 6 && (r === 0 || r === 6) ) || 
                     (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i === 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},
	
	createMovieClip : function(target_mc, instance_name, depth) {
	
		var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
		var cs = 1;
	
		this.make();

		for (var row = 0; row < this.modules.length; row++) {
			
			var y = row * cs;
			
			for (var col = 0; col < this.modules[row].length; col++) {
	
				var x = col * cs;
				var dark = this.modules[row][col];
			
				if (dark) {
					qr_mc.beginFill(0, 100);
					qr_mc.moveTo(x, y);
					qr_mc.lineTo(x + cs, y);
					qr_mc.lineTo(x + cs, y + cs);
					qr_mc.lineTo(x, y + cs);
					qr_mc.endFill();
				}
			}
		}
		
		return qr_mc;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] !== null) {
				continue;
			}
			this.modules[r][6] = (r % 2 === 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] !== null) {
				continue;
			}
			this.modules[6][c] = (c % 2 === 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] !== null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (Math.abs(r) === 2 || 
                            Math.abs(c) === 2 ||
                            (r === 0 && c === 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        var mod;
	
		for (var i = 0; i < 18; i++) {
			mod = (!test && ( (bits >> i) & 1) === 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var x = 0; x < 18; x++) {
			mod = (!test && ( (bits >> x) & 1) === 1);
			this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
        var mod;
	
		// vertical		
		for (var v = 0; v < 15; v++) {
	
			mod = (!test && ( (bits >> v) & 1) === 1);
	
			if (v < 6) {
				this.modules[v][8] = mod;
			} else if (v < 8) {
				this.modules[v + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + v][8] = mod;
			}
		}
	
		// horizontal
		for (var h = 0; h < 15; h++) {
	
			mod = (!test && ( (bits >> h) & 1) === 1);
			
			if (h < 8) {
				this.modules[8][this.moduleCount - h - 1] = mod;
			} else if (h < 9) {
				this.modules[8][15 - h - 1 + 1] = mod;
			} else {
				this.modules[8][15 - h - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col === 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] === null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) === 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var x = 0; x < rsBlocks.length; x++) {
		totalDataCount += rsBlocks[x].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. (" + 
            buffer.getLengthInBits() + 
            ">" +  
            totalDataCount * 8 + 
            ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 !== 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new Array(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var x = 0; x < ecdata[r].length; x++) {
            var modIndex = x + modPoly.getLength() - ecdata[r].length;
			ecdata[r][x] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var y = 0; y < rsBlocks.length; y++) {
		totalCodeCount += rsBlocks[y].totalCount;
	}

	var data = new Array(totalCodeCount);
	var index = 0;

	for (var z = 0; z < maxDcCount; z++) {
		for (var s = 0; s < rsBlocks.length; s++) {
			if (z < dcdata[s].length) {
				data[index++] = dcdata[s][z];
			}
		}
	}

	for (var xx = 0; xx < maxEcCount; xx++) {
		for (var t = 0; t < rsBlocks.length; t++) {
			if (xx < ecdata[t].length) {
				data[index++] = ecdata[t][xx];
			}
		}
	}

	return data;

};

module.exports = QRCode;

  };

  var QRCode = req('index'), LV = req('QRErrorCorrectLevel');
  function matrix(text, level) {
    text = String(text);
    var q = new QRCode(-1, LV[level || 'M']); q.addData(text); q.make();
    var n = q.getModuleCount(), m = [];
    for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c) ? 1 : 0; }
    return m;
  }
  function svg(text, o) {
    o = o || {}; var m = matrix(text, o.level), n = m.length, q = o.quiet == null ? 4 : o.quiet, t = n + q * 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" width="' + (o.size || 240) + '" height="' + (o.size || 240) + '" shape-rendering="crispEdges" role="img" aria-label="Kode QR"><rect width="' + t + '" height="' + t + '" fill="' + (o.bg || '#fff') + '"/><path d="' + d + '" fill="' + (o.fg || '#000') + '"/></svg>';
  }
  root.QRMake = { matrix: matrix, svg: svg, _lib: { QRRSBlock: req('QRRSBlock'), QRMath: req('QRMath') } };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.QRMake;
})(typeof window !== 'undefined' ? window : globalThis);
/* =========================================================
   PEMBACA KODE QR — murni JavaScript, jalan OFFLINE (tanpa internet, tanpa pustaka luar).
   Memakai BarcodeDetector bawaan browser bila ada (cepat), dan pembaca sendiri sebagai cadangan:
   cari 3 pola sudut -> homografi (dengan pola alignment) -> format -> buang mask -> koreksi Reed-Solomon -> teks.
   Pemakaian:
     QRRead.fromImageData({data,width,height})   -> {text,version,level} | null
     await QRRead.fromFile(file)                  -> teks | null  (foto/screenshot QR)
     QRRead.scanVideo(videoEl, onText)            -> fungsi stop() (kamera langsung)
   Butuh qr-encode.js (tabel blok RS) di halaman yang sama.
   ========================================================= */
(function (root) {
  'use strict';
  var RSB = function () { return (root.QRMake && root.QRMake._lib.QRRSBlock); };

  /* ---------- GF(256) & Reed-Solomon ---------- */
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () { var x = 1; for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function inv(a) { return EXP[255 - LOG[a]]; }

  function rsCorrect(cw, ec) {                       // cw: array (data+ec). Mengembalikan true bila valid/terkoreksi.
    var n = cw.length, S = new Array(ec), bad = false, i, j;
    for (i = 0; i < ec; i++) { var s = 0, a = EXP[i]; for (j = 0; j < n; j++) s = mul(s, a) ^ cw[j]; S[i] = s; if (s) bad = true; }
    if (!bad) return true;
    var C = [1], B = [1], L = 0, m = 1, b = 1;
    for (var k = 0; k < ec; k++) {
      var d = S[k]; for (i = 1; i <= L; i++) d ^= mul(C[i] || 0, S[k - i]);
      if (d === 0) { m++; continue; }
      var T = C.slice(), coef = mul(d, inv(b));
      while (C.length < B.length + m) C.push(0);
      for (i = 0; i < B.length; i++) C[i + m] ^= mul(coef, B[i]);
      if (2 * L <= k) { L = k + 1 - L; B = T; b = d; m = 1; } else m++;
    }
    if (L * 2 > ec) return false;
    var pos = [];
    for (i = 0; i < n; i++) {                        // Chien: akar di α^-(n-1-j)
      var x = EXP[(255 - ((n - 1 - i) % 255)) % 255], v = 0, xp = 1;
      for (j = 0; j <= L; j++) { v ^= mul(C[j] || 0, xp); xp = mul(xp, x); }
      if (v === 0) pos.push(i);
    }
    if (pos.length !== L) return false;
    var Om = new Array(ec).fill(0);                  // Ω = S·σ mod x^ec
    for (i = 0; i < ec; i++) for (j = 0; j <= i && j <= L; j++) Om[i] ^= mul(S[i - j], C[j] || 0);
    for (var q = 0; q < pos.length; q++) {
      var p = pos[q], Xk = EXP[(n - 1 - p) % 255], Xi = inv(Xk), num = 0, xp2 = 1, den = 0;
      for (j = 0; j < ec; j++) { num ^= mul(Om[j], xp2); xp2 = mul(xp2, Xi); }
      xp2 = 1; for (j = 1; j <= L; j += 2) { den ^= mul(C[j] || 0, xp2); xp2 = mul(xp2, mul(Xi, Xi)); }
      if (!den) return false;
      cw[p] ^= mul(Xk, mul(num, inv(den)));
    }
    for (i = 0; i < ec; i++) { var s2 = 0, a2 = EXP[i]; for (j = 0; j < n; j++) s2 = mul(s2, a2) ^ cw[j]; if (s2) return false; }
    return true;
  }

  /* ---------- pengubah gambar -> biner ---------- */
  function toGray(img) { var d = img.data, n = img.width * img.height, g = new Uint8Array(n); for (var i = 0, p = 0; i < n; i++, p += 4) g[i] = (d[p] * 299 + d[p + 1] * 587 + d[p + 2] * 114) / 1000; return g; }
  function shrink(img, max) {
    var w = img.width, h = img.height, s = Math.max(w, h) / max; if (s <= 1) return img;
    var nw = Math.floor(w / s), nh = Math.floor(h / s), out = new Uint8ClampedArray(nw * nh * 4), d = img.data;
    for (var y = 0; y < nh; y++) for (var x = 0; x < nw; x++) {
      var x0 = Math.floor(x * s), x1 = Math.max(x0 + 1, Math.floor((x + 1) * s)), y0 = Math.floor(y * s), y1 = Math.max(y0 + 1, Math.floor((y + 1) * s)), r = 0, g = 0, b = 0, c = 0;
      for (var yy = y0; yy < y1 && yy < h; yy++) for (var xx = x0; xx < x1 && xx < w; xx++) { var p = (yy * w + xx) * 4; r += d[p]; g += d[p + 1]; b += d[p + 2]; c++; }
      var o = (y * nw + x) * 4; out[o] = r / c; out[o + 1] = g / c; out[o + 2] = b / c; out[o + 3] = 255;
    }
    return { data: out, width: nw, height: nh };
  }
  function otsu(g) {
    var h = new Array(256).fill(0), i; for (i = 0; i < g.length; i++) h[g[i]]++;
    var tot = g.length, sum = 0; for (i = 0; i < 256; i++) sum += i * h[i];
    var sb = 0, wb = 0, best = 0, th = 127;
    for (i = 0; i < 256; i++) { wb += h[i]; if (!wb) continue; var wf = tot - wb; if (!wf) break; sb += i * h[i]; var mb = sb / wb, mf = (sum - sb) / wf, v = wb * wf * (mb - mf) * (mb - mf); if (v > best) { best = v; th = i; } }
    return th;
  }
  function binarize(g, w, h, mode, invert) {
    var bin = new Uint8Array(w * h), i;
    if (mode === 'otsu') { var t = otsu(g); for (i = 0; i < g.length; i++) bin[i] = g[i] <= t ? 1 : 0; }
    else {                                           // adaptif: rata-rata lokal (integral image)
      var s = Math.max(15, (Math.min(w, h) / 8) | 0), I = new Float64Array((w + 1) * (h + 1)), x, y;
      for (y = 0; y < h; y++) { var row = 0; for (x = 0; x < w; x++) { row += g[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; } }
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        var x0 = Math.max(0, x - s), x1 = Math.min(w, x + s + 1), y0 = Math.max(0, y - s), y1 = Math.min(h, y + s + 1);
        var sm = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0], mean = sm / ((x1 - x0) * (y1 - y0));
        bin[y * w + x] = g[y * w + x] < mean * 0.88 ? 1 : (g[y * w + x] < mean - 6 && g[y * w + x] < 110 ? 1 : 0);
      }
    }
    if (invert) for (i = 0; i < bin.length; i++) bin[i] ^= 1;
    return bin;
  }

  /* ---------- pola sudut (finder) ---------- */
  function lineRuns(bin, w, h, x, y, dx, dy) {
    function get(i) { var xx = x + dx * i, yy = y + dy * i; return (xx < 0 || yy < 0 || xx >= w || yy >= h) ? -1 : bin[yy * w + xx]; }
    if (get(0) !== 1) return null;
    var a = 0, b = 0, c, l1 = 0, l2 = 0, d1 = 0, d2 = 0;
    while (get(-a - 1) === 1) a++; while (get(b + 1) === 1) b++;
    c = a + b + 1;
    var o = -a - 1; while (get(o) === 0) { l1++; o--; } if (get(o) === -1) return null;
    while (get(o) === 1) { d1++; o--; }
    o = b + 1; while (get(o) === 0) { l2++; o++; } if (get(o) === -1) return null;
    while (get(o) === 1) { d2++; o++; }
    return { r: [d1, l1, c, l2, d2], mid: (b - a) / 2 };
  }
  function okRatio(r) {
    var t = r[0] + r[1] + r[2] + r[3] + r[4], m = t / 7, v = m * 0.75;
    return Math.abs(r[0] - m) < v && Math.abs(r[1] - m) < v && Math.abs(r[2] - 3 * m) < 3 * v && Math.abs(r[3] - m) < v && Math.abs(r[4] - m) < v ? m : 0;
  }
  function findFinders(bin, w, h) {
    var cands = [];
    function add(cx, cy, ms) {
      for (var i = 0; i < cands.length; i++) { var c = cands[i]; if (Math.abs(c.x - cx) < Math.max(c.ms, ms) * 2 && Math.abs(c.y - cy) < Math.max(c.ms, ms) * 2 && Math.abs(c.ms - ms) < Math.max(c.ms, ms) * 0.7) { var n = c.n; c.x = (c.x * n + cx) / (n + 1); c.y = (c.y * n + cy) / (n + 1); c.ms = (c.ms * n + ms) / (n + 1); c.n++; return; } }
      cands.push({ x: cx, y: cy, ms: ms, n: 1 });
    }
    for (var y = 0; y < h; y++) {
      var runs = [], starts = [], cur = bin[y * w], st = 0, x;
      for (x = 1; x <= w; x++) { var v = x < w ? bin[y * w + x] : -1; if (v !== cur) { runs.push(x - st); starts.push(st); st = x; cur = v; } }
      var first = bin[y * w];                        // run ke-0 berwarna 'first'
      for (var i = 0; i + 4 < runs.length; i++) {
        if (((i % 2 === 0) ? first : 1 - first) !== 1) continue;
        var r = [runs[i], runs[i + 1], runs[i + 2], runs[i + 3], runs[i + 4]], m = okRatio(r); if (!m) continue;
        var cx = Math.round(starts[i + 2] + r[2] / 2 - 0.5), v1 = lineRuns(bin, w, h, cx, y, 0, 1); if (!v1) continue;
        var m1 = okRatio(v1.r); if (!m1) continue;
        var cy = y + v1.mid, h1 = lineRuns(bin, w, h, cx, Math.round(cy), 1, 0); if (!h1) continue;
        var m2 = okRatio(h1.r); if (!m2) continue;
        add(cx + h1.mid, cy, (m + m1 + m2) / 3);
      }
    }
    return cands.filter(function (c) { return c.n >= 2; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 14);
  }
  function pickTriples(c) {
    var out = [], i, j, k;
    for (i = 0; i < c.length; i++) for (j = i + 1; j < c.length; j++) for (k = j + 1; k < c.length; k++) {
      var P = [c[i], c[j], c[k]], ms = [P[0].ms, P[1].ms, P[2].ms], mx = Math.max.apply(0, ms), mn = Math.min.apply(0, ms); if (mx / mn > 1.6) continue;
      var d = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }, dd = [d(P[1], P[2]), d(P[0], P[2]), d(P[0], P[1])], hi = dd.indexOf(Math.max.apply(0, dd)), tl = P[hi], p = P[(hi + 1) % 3], q = P[(hi + 2) % 3];
      var da = d(tl, p), db = d(tl, q); if (Math.abs(da - db) > 0.3 * Math.max(da, db)) continue;
      var ax = p.x - tl.x, ay = p.y - tl.y, bx = q.x - tl.x, by = q.y - tl.y, cos = (ax * bx + ay * by) / (da * db); if (Math.abs(cos) > 0.35) continue;
      var cross = ax * by - ay * bx, tr = cross > 0 ? p : q, bl = cross > 0 ? q : p;
      var mm = (P[0].ms + P[1].ms + P[2].ms) / 3, dm = (da + db) / 2 / mm;
      if (dm < 8 || dm > 200) continue;
      out.push({ tl: tl, tr: tr, bl: bl, ms: mm, sc: Math.abs(da - db) / da + Math.abs(cos) + P[0].n * -0.0001 });
    }
    return out.sort(function (a, b) { return a.sc - b.sc; }).slice(0, 4);
  }

  /* ---------- homografi ---------- */
  function homography(src, dst) {                    // 4 titik -> matriks 3x3 (h33 = 1)
    var A = [], i;
    for (i = 0; i < 4; i++) { var x = src[i][0], y = src[i][1], u = dst[i][0], v = dst[i][1]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]); A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]); }
    for (var c = 0; c < 8; c++) {
      var p = c; for (i = c + 1; i < 8; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      var t = A[c]; A[c] = A[p]; A[p] = t; if (Math.abs(A[c][c]) < 1e-12) return null;
      for (i = 0; i < 8; i++) if (i !== c) { var f = A[i][c] / A[c][c]; for (var k = c; k < 9; k++) A[i][k] -= f * A[c][k]; }
    }
    var H = []; for (i = 0; i < 8; i++) H.push(A[i][8] / A[i][i]); H.push(1); return H;
  }
  function mapPt(H, x, y) { var w = H[6] * x + H[7] * y + H[8]; return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]; }

  /* ---------- struktur QR ---------- */
  function alignPos(v) {
    if (v === 1) return [];
    var n = Math.floor(v / 7) + 2, last = 17 + 4 * v - 7, step = v === 32 ? 26 : Math.ceil((last - 6) / (n - 1) / 2) * 2, a = [6];
    for (var i = n - 2; i >= 0; i--) a.push(last - i * step);
    return a;
  }
  function funcMask(v) {
    var dim = 17 + 4 * v, f = new Uint8Array(dim * dim), r, c;
    function box(r0, c0, r1, c1) { for (var a = r0; a <= r1; a++) for (var b = c0; b <= c1; b++) if (a >= 0 && b >= 0 && a < dim && b < dim) f[a * dim + b] = 1; }
    box(0, 0, 8, 8); box(0, dim - 8, 8, dim - 1); box(dim - 8, 0, dim - 1, 8); box(6, 0, 6, dim - 1); box(0, 6, dim - 1, 6);
    var ap = alignPos(v); ap.forEach(function (y) { ap.forEach(function (x) { if ((y === 6 && x === 6) || (y === 6 && x === ap[ap.length - 1]) || (x === 6 && y === ap[ap.length - 1])) return; box(y - 2, x - 2, y + 2, x + 2); }); });
    if (v >= 7) { box(0, dim - 11, 5, dim - 9); box(dim - 11, 0, dim - 9, 5); }
    return f;
  }
  var FMT = (function () { var t = []; for (var d = 0; d < 32; d++) { var r = d << 10; for (var i = 14; i >= 10; i--) if ((r >> i) & 1) r ^= 0x537 << (i - 10); t.push([((d << 10) | r) ^ 0x5412, d]); } return t; })();
  function pc(x) { var n = 0; while (x) { n++; x &= x - 1; } return n; }
  function readFormat(get, dim) {
    var b1 = 0, b2 = 0, i;
    for (i = 0; i <= 5; i++) b1 = (b1 << 1) | get(8, i); b1 = (b1 << 1) | get(8, 7); b1 = (b1 << 1) | get(8, 8); b1 = (b1 << 1) | get(7, 8); for (i = 5; i >= 0; i--) b1 = (b1 << 1) | get(i, 8);
    for (i = dim - 1; i >= dim - 7; i--) b2 = (b2 << 1) | get(i, 8); for (i = dim - 8; i < dim; i++) b2 = (b2 << 1) | get(8, i);
    var best = null, bd = 99;
    [b1, b2].forEach(function (b) { FMT.forEach(function (f) { var d = pc(b ^ f[0]); if (d < bd) { bd = d; best = f[1]; } }); });
    return bd <= 3 ? { ec: best >> 3, mask: best & 7 } : null;   // get(r,c): baris r, kolom c
  }
  var MASKS = [function (r, c) { return (r + c) % 2 === 0; }, function (r) { return r % 2 === 0; }, function (r, c) { return c % 3 === 0; }, function (r, c) { return (r + c) % 3 === 0; }, function (r, c) { return (((r / 2) | 0) + ((c / 3) | 0)) % 2 === 0; }, function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; }, function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; }, function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }];
  var ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  var LEVEL = { 1: 1, 0: 0, 3: 3, 2: 2 }, LNAME = { 1: 'L', 0: 'M', 3: 'Q', 2: 'H' };   // bit format -> konstanta level QRMake

  function parseBits(cw, v) {
    var bits = [], i; cw.forEach(function (b) { for (var k = 7; k >= 0; k--) bits.push((b >> k) & 1); });
    var pos = 0; function rd(n) { var x = 0; for (var k = 0; k < n; k++) { if (pos >= bits.length) throw 0; x = (x << 1) | bits[pos++]; } return x; }
    var bytes = [], str = '';
    try {
      for (;;) {
        if (pos + 4 > bits.length) break; var mode = rd(4); if (mode === 0) break;
        if (mode === 4) { var n = rd(v <= 9 ? 8 : 16); for (i = 0; i < n; i++) bytes.push(rd(8)); }
        else if (mode === 2) { var na = rd(v <= 9 ? 9 : v <= 26 ? 11 : 13); flush(); for (i = 0; i + 1 < na; i += 2) { var q = rd(11); str += ALNUM[(q / 45) | 0] + ALNUM[q % 45]; } if (na & 1) str += ALNUM[rd(6)]; }
        else if (mode === 1) { var nn = rd(v <= 9 ? 10 : v <= 26 ? 12 : 14); flush(); for (i = 0; i + 2 < nn; i += 3) str += ('00' + rd(10)).slice(-3); if (nn % 3 === 2) str += ('0' + rd(7)).slice(-2); else if (nn % 3 === 1) str += rd(4); }
        else if (mode === 7) rd(8);
        else if (mode === 3) rd(16);
        else if (mode === 5) { }
        else return null;
      }
    } catch (e) { return null; }
    flush();
    function flush() { if (bytes.length) { var u = new Uint8Array(bytes); bytes = []; var s; try { s = new TextDecoder('utf-8', { fatal: true }).decode(u); } catch (e) { s = String.fromCharCode.apply(null, Array.prototype.slice.call(u)); } str += s; } }
    return str;
  }

  function sampleGrid(bin, w, h, H, dim) {
    var g = new Uint8Array(dim * dim), mp = function (x, y) { var p = mapPt(H, x, y), xx = Math.round(p[0]), yy = Math.round(p[1]); return (xx < 0 || yy < 0 || xx >= w || yy >= h) ? 0 : bin[yy * w + xx]; };
    for (var r = 0; r < dim; r++) for (var c = 0; c < dim; c++) {
      var x = c + 0.5, y = r + 0.5, s = mp(x, y) * 2 + mp(x - 0.22, y) + mp(x + 0.22, y) + mp(x, y - 0.22) + mp(x, y + 0.22);
      g[r * dim + c] = s >= 4 ? 1 : 0;
    }
    return g;
  }
  function decodeGrid(g, dim) {
    var v = (dim - 17) / 4, get = function (r, c) { return g[r * dim + c]; };
    var fm = readFormat(get, dim); if (!fm) return null;
    var lv = LEVEL[fm.ec], fn = funcMask(v), mk = MASKS[fm.mask], bits = [], up = true, c, i, k, r;
    for (c = dim - 1; c > 0; c -= 2) { if (c === 6) c--; for (i = 0; i < dim; i++) { r = up ? dim - 1 - i : i; for (k = 0; k < 2; k++) { var cc = c - k; if (!fn[r * dim + cc]) bits.push(g[r * dim + cc] ^ (mk(r, cc) ? 1 : 0)); } } up = !up; }
    var cw = []; for (i = 0; i + 7 < bits.length; i += 8) { var b = 0; for (k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; cw.push(b); }
    var blocks = RSB().getRSBlocks(v, lv); if (!blocks) return null;
    var total = 0; blocks.forEach(function (b) { total += b.totalCount; }); if (cw.length < total) return null;
    var datas = blocks.map(function () { return []; }), maxD = 0, p = 0; blocks.forEach(function (b) { maxD = Math.max(maxD, b.dataCount); });
    for (i = 0; i < maxD; i++) blocks.forEach(function (b, bi) { if (i < b.dataCount) datas[bi].push(cw[p++]); });
    var maxE = 0; blocks.forEach(function (b) { maxE = Math.max(maxE, b.totalCount - b.dataCount); });
    var ecs = blocks.map(function () { return []; });
    for (i = 0; i < maxE; i++) blocks.forEach(function (b, bi) { if (i < b.totalCount - b.dataCount) ecs[bi].push(cw[p++]); });
    var out = [];
    for (i = 0; i < blocks.length; i++) { var blk = datas[i].concat(ecs[i]); if (!rsCorrect(blk, ecs[i].length)) return null; out = out.concat(blk.slice(0, blocks[i].dataCount)); }
    var txt = parseBits(out, v); return txt == null ? null : { text: txt, version: v, level: LNAME[fm.ec] };
  }

  function tryOne(bin, w, h) {
    var fin = findFinders(bin, w, h); if (fin.length < 3) return null;
    var tr3 = pickTriples(fin);
    for (var t = 0; t < tr3.length; t++) {
      var T = tr3[t], est = Math.hypot(T.tr.x - T.tl.x, T.tr.y - T.tl.y) / T.ms + 7, v0 = Math.round((est - 17) / 4), vs = [v0, v0 + 1, v0 - 1, v0 + 2, v0 - 2];
      for (var vi = 0; vi < vs.length; vi++) {
        var v = vs[vi]; if (v < 1 || v > 40) continue; var dim = 17 + 4 * v;
        var P0 = [T.tl.x, T.tl.y], U = [(T.tr.x - T.tl.x) / (dim - 7), (T.tr.y - T.tl.y) / (dim - 7)], V = [(T.bl.x - T.tl.x) / (dim - 7), (T.bl.y - T.tl.y) / (dim - 7)];
        var m = function (x, y) { return [P0[0] + (x - 3.5) * U[0] + (y - 3.5) * V[0], P0[1] + (y - 3.5) * V[1] + (x - 3.5) * U[1]]; };
        var src = [[3.5, 3.5], [dim - 3.5, 3.5], [3.5, dim - 3.5], [dim - 6.5, dim - 6.5]], dst = [m(3.5, 3.5), m(dim - 3.5, 3.5), m(3.5, dim - 3.5), m(dim - 6.5, dim - 6.5)];
        var tries = [dst.slice()];
        if (v >= 2) {                                // cari pola alignment kanan-bawah (koreksi perspektif)
          var best = -1, bp = null, pr = dst[3], step = 0.25;
          for (var ox = -3; ox <= 3; ox += step) for (var oy = -3; oy <= 3; oy += step) {
            var cx = pr[0] + ox * U[0] + oy * V[0], cy = pr[1] + ox * U[1] + oy * V[1], sc = 0;
            for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) {
              var px = Math.round(cx + a * U[0] + b * V[0]), py = Math.round(cy + a * U[1] + b * V[1]); if (px < 0 || py < 0 || px >= w || py >= h) continue;
              var want = (Math.max(Math.abs(a), Math.abs(b)) !== 1) ? 1 : 0; if (bin[py * w + px] === want) sc++;
            }
            if (sc > best) { best = sc; bp = [cx, cy]; }
          }
          if (best >= 22) tries.unshift([dst[0], dst[1], dst[2], bp]);
        }
        for (var ti = 0; ti < tries.length; ti++) {
          var H = homography(src, tries[ti]); if (!H) continue;
          var res = decodeGrid(sampleGrid(bin, w, h, H, dim), dim); if (res) return res;
        }
      }
    }
    return null;
  }

  var Read = { fromImageData: function (img) {
    if (!RSB()) throw new Error('qr-encode.js belum dimuat');
    var im = shrink(img, 1100), g = toGray(im), w = im.width, h = im.height, modes = ['otsu', 'adapt'];
    for (var mi = 0; mi < modes.length; mi++) for (var inv = 0; inv < 2; inv++) {
      var r = tryOne(binarize(g, w, h, modes[mi], inv), w, h); if (r) return r;
    }
    return null;
  } };

  /* ---------- pembantu browser ---------- */
  Read.fromCanvas = async function (cv) {
    if ('BarcodeDetector' in root) { try { var d = new root.BarcodeDetector({ formats: ['qr_code'] }), r = await d.detect(cv); if (r && r[0] && r[0].rawValue) return r[0].rawValue; } catch (e) {} }
    var ctx = cv.getContext('2d', { willReadFrequently: true }), r2 = Read.fromImageData(ctx.getImageData(0, 0, cv.width, cv.height)); return r2 ? r2.text : null;
  };
  Read.fromFile = async function (file) {
    var bmp = await createImageBitmap(file), s = Math.min(1, 1300 / Math.max(bmp.width, bmp.height)), cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(bmp.width * s)); cv.height = Math.max(1, Math.round(bmp.height * s));
    var ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
    var t = await Read.fromCanvas(cv);
    if (!t && s === 1 && Math.max(cv.width, cv.height) < 500) {                  // gambar kecil: perbesar lalu coba lagi
      var c2 = document.createElement('canvas'); c2.width = cv.width * 3; c2.height = cv.height * 3; var x2 = c2.getContext('2d', { willReadFrequently: true }); x2.imageSmoothingEnabled = false; x2.drawImage(cv, 0, 0, c2.width, c2.height); t = await Read.fromCanvas(c2);
    }
    return t;
  };
  Read.scanVideo = function (video, onText) {
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true }), stop = false, busy = false, timer;
    function tick() {
      if (stop) return;
      if (!busy && video.videoWidth) {
        busy = true; var s = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight)); cv.width = Math.round(video.videoWidth * s); cv.height = Math.round(video.videoHeight * s); ctx.drawImage(video, 0, 0, cv.width, cv.height);
        Read.fromCanvas(cv).then(function (t) { busy = false; if (t && !stop) { stop = true; onText(t); } }, function () { busy = false; });
      }
      timer = setTimeout(tick, 220);
    }
    tick(); return function () { stop = true; clearTimeout(timer); };
  };

  root.QRRead = Read; if (typeof module !== 'undefined' && module.exports) module.exports = Read;
})(typeof window !== 'undefined' ? window : globalThis);
