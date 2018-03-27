/**
 * Copyright (c) 2013-2018 Netflix, Inc.  All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var LzwCompression = require('msl-core/util/LzwCompression.js');
    
/**
 * LZW output stream tests.
 * 
 * @author Wesley Miaw <wmiaw@netflix.com>
 */
describe("LzwCompression", function () {
    var MAX_DEFLATE_RATIO = 200;
    
    var lzw = new LzwCompression();
    
    it("compress one byte", function () {
        var data = new Uint8Array([0x1f]);

        var compressed = lzw.compress(data);

        expect(compressed).not.toBeNull();
        expect(compressed.length).toEqual(1);
        expect(compressed[0]).toEqual(data[0]);
    });

    it("compress two bytes", function () {
        var data = new Uint8Array([0x66, 0x67]);
        // This compresses to 3 bytes: [ 0x66, 0x33, 0x80 ]

        var compressed = lzw.compress(data);

        expect(compressed).toBeNull();
    });

    it("compress three bytes", function () {
        var data = new Uint8Array([0x61, 0xd7, 0xb1]);
        // This compresses to 4 bytes: [ 0x61, 0x6b, 0xac, 0x40 ]

        var compressed = lzw.compress(data);

        expect(compressed).toBeNull();
    });

    it("uncompress one byte", function () {
        var codes = new Uint8Array([0xf1]);

        var uncompressed = lzw.uncompress(codes, MAX_DEFLATE_RATIO);

        expect(uncompressed[0]).toEqual(codes[0]);
    });

    it("uncompress two bytes", function () {
        var codes = new Uint8Array([0x66, 0x33, 0x80]);
        var data = new Uint8Array([0x66, 0x67]);

        var uncompressed = lzw.uncompress(codes, MAX_DEFLATE_RATIO);

        expect(uncompressed.length).toEqual(data.length);
        expect(new Uint8Array(uncompressed)).toEqual(data);
    });

    it("uncompress three bytes", function () {
        var codes = new Uint8Array([0x61, 0x6b, 0xac, 0x40]);
        var data = new Uint8Array([0x61, 0xd7, 0xb1]);

        var uncompressed = lzw.uncompress(codes, MAX_DEFLATE_RATIO);

        expect(uncompressed.length).toEqual(data.length);
        expect(new Uint8Array(uncompressed)).toEqual(data);
    });
    
    it("uncompress ratio exceeded", function() {
        var codes = new Uint8Array([
            0x00, 0x80, 0x40, 0x60, 0x50, 0x38, 0x24, 0x16, 0x0d, 0x07, 0x84, 0x42, 0x61, 0x50, 0xb8, 0x64,
            0x36, 0x1d, 0x0f, 0x88, 0x44, 0x62, 0x51, 0x38, 0xa4, 0x56, 0x2d, 0x17, 0x8c, 0x46, 0x63, 0x51,
            0xb8, 0xe4, 0x76, 0x3d, 0x1f, 0x90, 0x48, 0x64, 0x52, 0x39, 0x24, 0x96, 0x4d, 0x27, 0x94, 0x4a,
            0x65, 0x52, 0x00 ]);
        var data = new Uint8Array(1024);
        
        var compressed = lzw.compress(data);
        expect(compressed).toEqual(codes);
        
        var uncompressed = lzw.uncompress(codes, MAX_DEFLATE_RATIO);
        expect(uncompressed.length).toEqual(data.length);
        expect(new Uint8Array(uncompressed)).toEqual(data);
        
        expect(function() { lzw.uncompress(codes, 10); }).toThrow(new MslIoException());
    });
    
    it("compress then uncompress", function () {
        var data = new Uint8Array([
            0x3c, 0x72, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x3e, 0x3c, 0x68, 0x65, 0x61, 0x64, 0x65, 0x72,
            0x3e, 0x3c, 0x70, 0x72, 0x65, 0x66, 0x65, 0x72, 0x72, 0x65, 0x64, 0x6c, 0x61, 0x6e, 0x67, 0x75,
            0x61, 0x67, 0x65, 0x73, 0x3e, 0x3c, 0x61, 0x70, 0x70, 0x73, 0x65, 0x6c, 0x65, 0x63, 0x74, 0x65,
            0x64, 0x6c, 0x61, 0x6e, 0x67, 0x75, 0x61, 0x67, 0x65, 0x73, 0x3e, 0x3c, 0x6c, 0x61, 0x6e, 0x67,
            0x75, 0x61, 0x67, 0x65, 0x3e, 0x3c, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x3e, 0x30, 0x3c, 0x2f, 0x69,
            0x6e, 0x64, 0x65, 0x78, 0x3e, 0x3c, 0x62, 0x63, 0x70, 0x34, 0x37, 0x3e, 0x65, 0x6e, 0x3c, 0x2f,
            0x62, 0x63, 0x70, 0x34, 0x37, 0x3e, 0x3c, 0x2f, 0x6c, 0x61, 0x6e, 0x67, 0x75, 0x61, 0x67, 0x65,
            0x3e, 0x3c, 0x2f, 0x61, 0x70, 0x70, 0x73, 0x65, 0x6c, 0x65, 0x63, 0x74, 0x65, 0x64, 0x6c, 0x61,
            0x6e, 0x67, 0x75, 0x61, 0x67, 0x65, 0x73, 0x3e, 0x3c, 0x2f, 0x70, 0x72, 0x65, 0x66, 0x65, 0x72,
            0x72, 0x65, 0x64, 0x6c, 0x61, 0x6e, 0x67, 0x75, 0x61, 0x67, 0x65, 0x73, 0x3e, 0x3c, 0x63, 0x6c,
            0x69, 0x65, 0x6e, 0x74, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x3e,
            0x3c, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x74, 0x69, 0x6d, 0x65, 0x3e, 0x31, 0x33, 0x36, 0x33,
            0x33, 0x39, 0x36, 0x33, 0x34, 0x37, 0x3c, 0x2f, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x74, 0x69,
            0x6d, 0x65, 0x3e, 0x3c, 0x63, 0x6c, 0x69, 0x65, 0x6e, 0x74, 0x74, 0x69, 0x6d, 0x65, 0x3e, 0x31,
            0x33, 0x36, 0x33, 0x33, 0x39, 0x36, 0x33, 0x34, 0x37, 0x3c, 0x2f, 0x63, 0x6c, 0x69, 0x65, 0x6e,
            0x74, 0x74, 0x69, 0x6d, 0x65, 0x3e, 0x3c, 0x2f, 0x63, 0x6c, 0x69, 0x65, 0x6e, 0x74, 0x73, 0x65,
            0x72, 0x76, 0x65, 0x72, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x3e, 0x3c, 0x2f, 0x68, 0x65, 0x61, 0x64,
            0x65, 0x72, 0x3e, 0x3c, 0x70, 0x69, 0x6e, 0x67, 0x2f, 0x3e, 0x3c, 0x2f, 0x72, 0x65, 0x71, 0x75,
            0x65, 0x73, 0x74, 0x3e
        ]);

        var compressed = lzw.compress(data);
        var uncompressed = lzw.uncompress(compressed, MAX_DEFLATE_RATIO);

        expect(new Uint8Array(uncompressed)).toEqual(data);
    });
});