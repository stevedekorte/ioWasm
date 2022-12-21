# Font 
The Font object can be used to load and render TrueType fonts. Example use:
```Io
// within a GLUT display callback...

timesFont = Font clone open(\"times.ttf\")
if (timesFont error, write(\"Error loading font: \", timesFont error, \"\n\"); return)
timesFont setPointSize(16)
glColor(0,0,0,1)
timesFont draw(\"This is a test.\")
```

<b>Rendering fonts using OpenGL textures</b>

Smaller fonts (those having a point size around 30 or smaller, depending on the font) will automatically be cached in and rendered from a texture. This technique is very fast and should support rendering speeds as fast (or faster than) those of typical desktop font rendering systems. Larger font sizes(due to texture memory constraints) will be rendered to a pixelmap when displayed. Thanks to Mike Austin for implementing the font texturing system.

# Installation
`freetype` should be install and foundable in your system. Then:

```
eerie install https://github.com/IoLanguage/Font.git
```
