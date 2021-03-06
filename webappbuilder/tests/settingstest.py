# -*- coding: utf-8 -*-
#
# (c) 2016 Boundless, http://boundlessgeo.com
# This code is licensed under the GPL 2.0 license.
#
import unittest
import sys
import utils
import os
from utils import *


class SettingsTest(unittest.TestCase):

    def setUp(self):
        utils.loadTestProject("settings")

    def testViewCrs(self):
        """Check that custom CRS correctly restored from appdef"""
        folder = createAppFromTestAppdef("viewcrs")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        self.assertTrue(checkTextInFile(outputFile, "EPSG:23030"))

    def testCanvasExtent(self):
        """Check that map extent correctly restored from appdef"""
        folder = createAppFromTestAppdef("canvasextent")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        #can't check canvas extent, since it depends on screen config, so we check it doesn't use layer one
        self.assertFalse(checkTextInFile(outputFile, "[55659.745397, 55660.451865, 1057535.162536, 1062414.311268]"))

    def testLayersExtent(self):
        """Check that layer extent correctly restored from appdef"""
        folder = createAppFromTestAppdef("layersextent")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        self.assertTrue(checkTextInFile(outputFile, "[55659.745397, 55660.451865, 1057535.162536, 1062414.311268]"))

    def testRestrictedExtent(self):
        """Check that extent restrictions correctly restored from appdef"""
        folder = createAppFromTestAppdef("restrictedextent")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        self.assertTrue(checkTextInFile(outputFile, "extent: [55659.745397, 55660.451865, 1057535.162536, 1062414.311268]"))

    def testScaleDependentVisibility(self):
        """Check that scale-dependent visibility correctly restored from appdef"""
        folder = createAppFromTestAppdef("scaledependentvisibility")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        self.assertTrue(checkTextInFile(outputFile, "maxResolution:28000.0672002,"))

    def testNoScaleDependentVisibility(self):
        """Check app creation without scale-dependent restrictions"""
        folder = createAppFromTestAppdef("noscaledependentvisibility")
        outputFile = os.path.join(folder, "webapp", "app_prebuilt.js")
        self.assertFalse(checkTextInFile(outputFile, "maxResolution:"))


def suite():
    suite = unittest.TestSuite()
    suite.addTests(unittest.makeSuite(SettingsTest, 'test'))
    return suite

def run_tests():
    unittest.TextTestRunner(verbosity=3, stream=sys.stdout).run(suite())
