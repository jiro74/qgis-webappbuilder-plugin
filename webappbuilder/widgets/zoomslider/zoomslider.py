from webappbuilder.webbappwidget import WebAppWidget
import os
from PyQt4.QtGui import QIcon

class ZoomSlider(WebAppWidget):

    _parameters = {"refreshRate": 100}

    def write(self, appdef, folder, app, progress):
        app.panels.append('''React.createElement("div", {id:'zoom-slider'},
                                    React.createElement(ZoomSlider, {map:map, refreshRate:%i})
                                  )''' % int(self._parameters["refreshRate"]))
        self.addReactComponent(app, "ZoomSlider")

    def icon(self):
        return QIcon(os.path.join(os.path.dirname(__file__), "zoom-slider.png"))

    def iconFile(self):
        return os.path.join(os.path.dirname(__file__), "zoom-slider.png")

    def description(self):
        return "Zoom slider"
