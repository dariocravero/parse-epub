const html = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta http-equiv="default-style" content="text/html; charset=utf-8"/>
  <title>Contents</title>
  <link rel="stylesheet" href="css/a-christmas-carol.css" type="text/css"/>
</head>
<body>
<nav epub:type="toc" id="toc">
  <h2>Contents</h2>
  <ol>
    <li>
      <a href="s001-BookTitlePage-01.xhtml">A Christmas Carol</a>
    </li>
    <li>
      <a href="s002-Copyright-01.xhtml">Copyright</a>
    </li>
    <li>
      <a href="s003-Introduction-01.xhtml">Introduction</a>
    </li>
    <li>
      <a href="s004-Preface-01.xhtml">Dramatis Personae</a>
    </li>
    <li>
      <a href="s005-AboutTheAuthor-01.xhtml">Preface</a>
    </li>
    <li>
      <a href="s006-Chapter-001.xhtml">Stave 1: Marley&#x2019;s Ghost</a>
    </li>
    <li>
      <a href="s007-Chapter-002.xhtml">Stave 2: The First of the Three Spirits</a>
    </li>
    <li>
      <a href="s008-Chapter-003.xhtml">Stave 3: The Second of the Three Spirits</a>
    </li>
    <li>
      <a href="s009-Chapter-004.xhtml">Stave 4: The Last of the Spirits</a>
    </li>
    <li>
      <a href="s010-Chapter-005.xhtml">Stave 5: The End of It</a>
    </li>
  </ol>
</nav>
</body>
</html>`;

const parser = new DOMParser();
export default parser.parseFromString(html, 'text/html');
