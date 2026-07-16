import * as Turbo from '@hotwired/turbo'
import { Application } from '@hotwired/stimulus'
import ThemeController from './controllers/theme_controller'
import MenuController from './controllers/menu_controller'
import HighlightController from './controllers/highlight_controller'
import SoftwareDrawerController from './controllers/software_drawer_controller'

Turbo.start()

const application = Application.start()
application.register('theme', ThemeController)
application.register('menu', MenuController)
application.register('highlight', HighlightController)
application.register('software-drawer', SoftwareDrawerController)
