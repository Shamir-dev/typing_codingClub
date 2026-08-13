// Keep markup as strings: TypingPane renders each character in a React text
// node, so these angle brackets are displayed and typed literally, never run.
export const HTML_CODE_SAMPLES = {
  'html-easy-001': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n</body>\n</html>',
  'html-easy-002': '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Visit Example</a>',
  'html-easy-003': '<img src="logo.png" alt="Company Logo">',
  'html-easy-004': '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>',
  'html-easy-005': '<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n</ol>',
  'html-easy-006': '<label for="username">Username</label>\n<input type="text" id="username">',
  'html-easy-007': '<table>\n  <thead>\n    <tr>\n      <th>Name</th>\n      <th>Age</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Alice</td>\n      <td>25</td>\n    </tr>\n  </tbody>\n</table>',
  'html-easy-008': '<input type="checkbox" id="terms" name="terms">\n<label for="terms">I agree to the terms</label>',
  'html-easy-009': '<input type="radio" id="male" name="gender" value="male">\n<label for="male">Male</label>\n<input type="radio" id="female" name="gender" value="female">\n<label for="female">Female</label>',
  'html-easy-010': '<form action="/submit" method="post">\n  <button type="submit">Send Data</button>\n</form>',
  'html-easy-011': '<select name="choice">\n  <option value="a">Option A</option>\n  <option value="b">Option B</option>\n</select>',
  'html-easy-012': '<textarea name="comments" rows="4" cols="50" placeholder="Enter your comments"></textarea>',
  'html-easy-013': '<header>\n  <nav>\n    <ul>\n      <li><a href="/">Home</a></li>\n      <li><a href="/about">About</a></li>\n    </ul>\n  </nav>\n</header>',
  'html-easy-014': '<article>\n  <section>\n    <h2>Blog Post</h2>\n    <p>This is the content of the blog post.</p>\n  </section>\n</article>',
  'html-easy-015': '<audio controls>\n  <source src="audio.mp3" type="audio/mpeg">\n  Your browser does not support the audio element.\n</audio>',
  'html-easy-016': '<video controls width="320" height="240">\n  <source src="video.mp4" type="video/mp4">\n  Your browser does not support the video tag.\n</video>',
  'html-easy-017': '<button type="button">Click Me</button>',
  'html-easy-018': '<footer>\n  <p>&copy; 2026 Company Name. All rights reserved.</p>\n</footer>',
  'html-easy-019': '<p>First line.<br>Second line.</p>\n<hr>\n<p>Next section content.</p>',
  'html-easy-020': '<head>\n  <meta name="description" content="Learn HTML">\n  <link rel="icon" href="favicon.ico">\n</head>',
}
