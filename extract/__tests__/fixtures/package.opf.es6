import { parseRawXml } from '../../../parse-raw';

export default parseRawXml(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" xml:lang="en" unique-identifier="pub-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title id="title">A Christmas Carol Audio Book</dc:title>
    <dc:creator id="creator">Charles Dickens</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="pub-id">a-christmas-carol-audio-book</dc:identifier>
    <dc:source>a-christmas-carol</dc:source>
    <meta property="dcterms:modified">2012-03-08T05:57:24Z</meta>
    <dc:date>2011-01-07</dc:date>
    <dc:publisher>Infogrid Pacific</dc:publisher>
    <dc:subject>Fiction</dc:subject>
    <dc:type>Book</dc:type>
    
    <!--MEDIA OVERLAY METADATA-->
    <meta property="media:duration" refines="#btitle">0:0:03</meta>
    <meta property="media:duration" refines="#intro">0:3:25</meta>
    <meta property="media:duration" refines="#preface">0:1:52</meta>
    <meta property="media:duration" refines="#author">0:0:28</meta>
    <meta property="media:duration" refines="#ch01">0:42:07</meta>
    <meta property="media:duration" refines="#ch02">0:38:38</meta>
    <meta property="media:duration" refines="#ch03">0:49:53</meta>
    <meta property="media:duration" refines="#ch04">0:32:45</meta>
    <meta property="media:duration" refines="#ch05">0:14:21</meta>
    <meta property="media:duration">3:3:32</meta>
    <meta property="media:narrator">LibriVox Team</meta>
    <meta property="media:active-class">correct</meta>
    
</metadata>
<manifest>
    <item id="toc" properties="nav" href="TOC.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-image" properties="cover-image" href="images/a-christmas-carol.jpg" media-type="image/jpeg"/>
    <item id="s001" href="s001-BookTitlePage-01.xhtml" media-type="application/xhtml+xml" media-overlay="btitle"/>
    <item id="s002" href="s002-Copyright-01.xhtml" media-type="application/xhtml+xml"/>
    <item id="s003" href="s003-Introduction-01.xhtml" media-type="application/xhtml+xml" media-overlay="intro"/>
    <item id="s004" href="s004-Preface-01.xhtml" media-type="application/xhtml+xml" media-overlay="preface"/>
    <item id="s005" href="s005-AboutTheAuthor-01.xhtml" media-type="application/xhtml+xml" media-overlay="author"/>
    <item id="s006" href="s006-Chapter-001.xhtml" media-type="application/xhtml+xml" media-overlay="ch01"/>
    <item id="s007" href="s007-Chapter-002.xhtml" media-type="application/xhtml+xml" media-overlay="ch02"/>
    <item id="s008" href="s008-Chapter-003.xhtml" media-type="application/xhtml+xml" media-overlay="ch03"/>
    <item id="s009" href="s009-Chapter-004.xhtml" media-type="application/xhtml+xml" media-overlay="ch04"/>
    <item id="s010" href="s010-Chapter-005.xhtml" media-type="application/xhtml+xml" media-overlay="ch05"/>
    
    <item id="btitle" href="s001-BookTitlePage-01.smil" media-type="application/smil+xml"/>
    <item id="intro" href="s003-Introduction-01.smil" media-type="application/smil+xml"/>
    <item id="preface" href="s004-Preface-01.smil" media-type="application/smil+xml"/>
    <item id="author" href="s005-AboutTheAuthor-01.smil" media-type="application/smil+xml"/>
    <item id="ch01" href="s006-Chapter-001.smil" media-type="application/smil+xml"/>
    <item id="ch02" href="s007-Chapter-002.smil" media-type="application/smil+xml"/>
    <item id="ch03" href="s008-Chapter-003.smil" media-type="application/smil+xml"/>
    <item id="ch04" href="s009-Chapter-004.smil" media-type="application/smil+xml"/>
    <item id="ch05" href="s010-Chapter-005.smil" media-type="application/smil+xml"/>
    
    <item id="audio01" href="audio/s001-BookTitlePage-01.mp3" fallback="audio02" media-type="audio/mpeg"/>
    <item id="audio02" href="audio/s001-BookTitlePage-01.ogg" media-type="audio/ogg"/>
    <item id="audio03" href="audio/s003-Introduction-01.mp3" fallback="audio04" media-type="audio/mpeg"/>
    <item id="audio04" href="audio/s003-Introduction-01.ogg" media-type="audio/ogg"/>
    <item id="audio05" href="audio/s004-Preface-01.mp3" fallback="audio06" media-type="audio/mpeg"/>
    <item id="audio06" href="audio/s004-Preface-01.ogg" media-type="audio/ogg"/>
    <item id="audio07" href="audio/s005-AboutTheAuthor-01.mp3" fallback="audio08" media-type="audio/mpeg"/>
    <item id="audio08" href="audio/s005-AboutTheAuthor-01.ogg" media-type="audio/ogg"/>
    <item id="audio09" href="audio/s006-Chapter-001.mp3" fallback="audio10" media-type="audio/mpeg"/>
    <item id="audio10" href="audio/s006-Chapter-001.ogg" media-type="audio/ogg"/>
    <item id="audio11" href="audio/s007-Chapter-002.mp3" fallback="audio12" media-type="audio/mpeg"/>
    <item id="audio12" href="audio/s007-Chapter-002.ogg" media-type="audio/ogg"/>
    <item id="audio13" href="audio/s008-Chapter-003.mp3" fallback="audio14" media-type="audio/mpeg"/>
    <item id="audio14" href="audio/s008-Chapter-003.ogg" media-type="audio/ogg"/>
    <item id="audio15" href="audio/s009-Chapter-004.mp3" fallback="audio16" media-type="audio/mpeg"/>
    <item id="audio16" href="audio/s009-Chapter-004.ogg" media-type="audio/ogg"/>
    <item id="audio17" href="audio/s010-Chapter-005.mp3" fallback="audio18" media-type="audio/mpeg"/>
    <item id="audio18" href="audio/s010-Chapter-005.ogg" media-type="audio/ogg"/>
    
    <item id="css-001" href="css/a-christmas-carol.css" media-type="text/css"/>
</manifest>
<spine page-progression-direction="ltr">
    <itemref idref="s001" linear="yes"/>
    <itemref idref="s002" linear="yes"/>
    <itemref idref="s003" linear="yes"/>
    <itemref idref="s004" linear="yes"/>
    <itemref idref="s005" linear="yes"/>
    <itemref idref="s006" linear="yes"/>
    <itemref idref="s007" linear="yes"/>
    <itemref idref="s008" linear="yes"/>
    <itemref idref="s009" linear="yes"/>
    <itemref idref="s010" linear="yes"/></spine>
</package>`);
