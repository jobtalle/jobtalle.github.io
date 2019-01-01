import json
import math
import sys
import os.path
import datetime

from sys import argv
from os import listdir

def format_page_name(name):
	return name.replace(" ", "_").lower() + ".html"

def compress(string):
	return string.replace("\t", "").replace(">\n", ">");


class Post:
	FILE_CONTENT = "content.html"
	FILE_PROPERTIES = "properties.json"
	FILE_KATEX_CSS = "katex_css.html"
	FILE_KATEX_SCRIPT = "katex_script.html"
	FILE_PRETTIFY = "prettify.html"

	PROPERTY_TITLE = "title"
	PROPERTY_ABSTRACT = "abstract"
	PROPERTY_PREVIEW = "preview"

	DIR_JAVASCRIPT = "js"
	DIR_CSS = "css"

	CLASS_POST_LINK = "post-link"
	CLASS_POST_REFERENCE = "post-reference"
	CLASS_POST_REFERENCE_LEFT = "post-reference-left"
	CLASS_POST_REFERENCE_RIGHT = "post-reference-right"

	ID_REFERENCES = "references"

	MONTH_ABBREVIATIONS = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sept",
		"Oct",
		"Nov",
		"Dec"
	]

	def __init__(self, site, directory):
		self.site = site
		self.directory = directory
		self.content = Site.DIR_POSTS + "/" + directory + "/" + self.FILE_CONTENT
		self.properties = Site.DIR_POSTS + "/" + directory + "/" + self.FILE_PROPERTIES

		self.validate_requirements()
		self.read_properties()

	@staticmethod
	def get_katex_css():
		file = open(Site.DIR_TEMPLATES + "/" + Post.FILE_KATEX_CSS)
		content = file.read()
		file.close()

		return content

	@staticmethod
	def get_katex_script():
		file = open(Site.DIR_TEMPLATES + "/" + Post.FILE_KATEX_SCRIPT)
		content = file.read()
		file.close()

		return content

	@staticmethod
	def get_prettify():
		file = open(Site.DIR_TEMPLATES + "/" + Post.FILE_PRETTIFY)
		content = file.read()
		file.close()

		return content

	def get_content(self, previous, next):
		contentFile = open(self.content)
		content = self.get_post_header(self.properties[self.PROPERTY_TITLE]) + contentFile.read() + self.build_neighbors(previous, next)
		contentFile.close()

		return content.replace("local src=\"", "src=\"" + self.site.DIR_POSTS + "/" + self.directory + "/")

	def build(self, previous, next):
		self.site.log("Building " + self.get_post_file_name())
		self.site.log_scope_increment()

		content = self.get_content(previous, next)

		if "$" in content:
			post_script = self.get_katex_script()
			additional_css = self.get_css() + self.get_katex_css()
		else:
			post_script = ""
			additional_css = self.get_css()

		if "<pre class=\"prettyprint" in content or "<code class=\"prettyprint" in content:
			post_script += self.get_prettify()

		result = self.site.template
		result = result.replace(self.site.KEY_TITLE, self.site.TITLE + self.site.TITLE_DIVISOR + self.properties[self.PROPERTY_TITLE])
		result = result.replace(self.site.KEY_DESCRIPTION, self.properties[self.PROPERTY_ABSTRACT])
		result = result.replace(self.site.KEY_ADDITIONAL_CSS, additional_css)
		result = result.replace(self.site.KEY_MENU_BUTTONS, self.site.build_menu())
		result = result.replace(self.site.KEY_CONTENT, content)
		result = result.replace(self.site.KEY_POST_SCRIPT, post_script)
		result = result.replace(self.site.KEY_META, self.get_meta())

		file = open(self.get_post_file_name(), "w")
		file.write(compress(result))
		file.close()

		self.site.log_scope_decrement()

		return self.build_post_link()

	def make_meta(self, property, content):
		return "<meta property=\"" + property + "\" content=\"" + content + "\"/>"

	def get_meta(self):
		return \
			self.make_meta("og:title", self.properties[self.PROPERTY_TITLE]) +\
			self.make_meta("og:url", self.site.URL + self.get_post_file_name()) +\
			self.make_meta("og:description", self.properties[self.PROPERTY_ABSTRACT]) +\
			self.make_meta("og:image", self.site.URL + self.site.DIR_POSTS + "/" + self.directory + "/" + self.properties[self.PROPERTY_PREVIEW]) +\
			self.make_meta("twitter:image", self.site.URL + self.site.DIR_POSTS + "/" + self.directory + "/" + self.properties[self.PROPERTY_PREVIEW]) +\
			self.make_meta("twitter:description", self.properties[self.PROPERTY_ABSTRACT]) + self.make_meta("twitter:site", "jobtalle.com") +\
			self.make_meta("twitter:card", "summary") + self.make_meta("twitter:title", self.properties[self.PROPERTY_TITLE])

	def get_css(self):
		result = ""

		dir = Site.DIR_POSTS + "/" + self.directory + "/" + self.DIR_CSS
		if os.path.isdir(dir):
			for file in listdir(dir):
				if file.endswith(".css"):
					result = result + "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + dir + "/" + file + "\">"

		return result

	def validate_requirements(self):
		if not os.path.isfile(self.content):
			self.site.log("Post " + self.directory + " has no " + self.FILE_CONTENT)
			self.site.abort()

		if not os.path.isfile(self.properties):
			self.site.log("Post " + self.directory + " has no " + self.FILE_PROPERTIES)
			self.site.abort()

	def read_properties(self):
		properties_file = open(self.properties)
		self.properties = json.load(properties_file)
		properties_file.close()

	def get_date(self):
		parts = self.directory.split("_")
		year = parts[0]
		month = self.MONTH_ABBREVIATIONS[int(parts[1]) - 1]
		day = parts[2]

		return str(day) + " " + month + " " + str(year)

	def get_post_header(self, title, url=None):
		if url is None:
			link_open = ""
			link_close = ""
		else:
			link_open = "<a href=\"" + url + "\">"
			link_close = "</a>"

		return \
			"<h1>" +\
			link_open +\
			title +\
			link_close +\
			"</h1><span class=\"date\">" +\
			self.get_date() +\
			"</span>"

	def get_preview(self):
		return \
			"<div class=\"post-link-preview\"><a href=\"" +\
			self.get_post_file_name() +\
			"\"><img src=\"" +\
			self.get_preview_file() +\
			"\" title=\"" +\
			self.properties[self.PROPERTY_TITLE] +\
			"\"></a></div>"

	def get_abstract(self):
		return "<p>" + self.properties[self.PROPERTY_ABSTRACT] + "</p>"

	def get_post_file_name(self):
		return format_page_name(self.properties[self.PROPERTY_TITLE])

	def get_preview_file(self):
		return self.site.DIR_POSTS + "/" + self.directory + "/" + self.properties[self.PROPERTY_PREVIEW]

	def build_neighbor(self, neighbor, type):
		if neighbor is None:
			return ""

		if type == self.CLASS_POST_REFERENCE_LEFT:
			title_prefix = "Previously: "
		else:
			title_prefix = "Up next: "

		return \
			"<a href=\"" +\
			neighbor.get_post_file_name() +\
			"\" title=\"" +\
			title_prefix +\
			neighbor.properties[self.PROPERTY_TITLE] +\
			"\"><div class=\"" +\
			self.CLASS_POST_REFERENCE +\
			" " +\
			type +\
			"\">" +\
			neighbor.properties[self.PROPERTY_TITLE] +\
			"</div></a>"

	def build_neighbors(self, previous, next):
		return \
			"<div id=\"" +\
			self.ID_REFERENCES +\
			"\">" +\
			self.build_neighbor(previous, self.CLASS_POST_REFERENCE_LEFT) +\
			self.build_neighbor(next, self.CLASS_POST_REFERENCE_RIGHT) +\
			"</div>"

	def build_post_link(self):
		return \
			"<div class=\"" +\
			self.CLASS_POST_LINK +\
			"\">" +\
			self.get_preview() +\
			self.get_post_header(self.properties[self.PROPERTY_TITLE], self.get_post_file_name()) +\
			self.get_abstract() +\
			"</div>"


class Site:
	URL = "https://jobtalle.com/"

	LOCALE = "en_US"

	TITLE = "Job Talle"
	TITLE_DIVISOR = " | "

	DESCRIPTION = "A blog on game development, AI & Algorithms"

	DIR_POSTS = "posts"
	DIR_JAVASCRIPT = "js"
	DIR_TEMPLATES = "templates"

	FILE_TEMPLATE = "template.html"
	FILE_LOADMORE = "loadmore.html"

	KEY_TITLE = "$title$"
	KEY_ADDITIONAL_CSS = "$additional-css$"
	KEY_MENU_BUTTONS = "$menu-buttons$"
	KEY_CONTENT = "$content$"
	KEY_POST_SCRIPT = "$post-script$"
	KEY_DESCRIPTION = "$description$"
	KEY_META = "$additional-meta$"

	INDEX_LINKS_PER_PAGE = 6

	SCRIPT_LOAD_MORE = "<script src=\"js/loadmore.js\"></script>"

	MENU_PAGES = [
		"index.html",
		"about.html",
		"contact.html"
	]
	MENU_TITLES = [
		"Blog",
		"About",
		"Contact"
	]

	def __init__(self, exclusive=None):
		self.validate_requirements()

		self.log_scope = 0
		self.log("Analyzing sources")

		self.exclusive = exclusive
		if self.exclusive is not None:
			self.log("Only building " + exclusive)

		self.template = self.read_template()
		self.posts = self.get_posts()

	@staticmethod
	def clean():
		for file in listdir("."):
			if file.endswith(".html"):
				os.remove(file)

	def build(self):
		self.log("Starting build")
		self.log_scope_increment()

		self.build_posts()

		if self.exclusive is None:
			self.build_indices()

			for index in range(1, len(self.MENU_PAGES)):
				self.build_page(self.MENU_PAGES[index], self.MENU_TITLES[index])

		self.log_scope_decrement()
		self.log("Done")

	def build_menu(self, current = None):
		result = ""

		for page, title in zip(self.MENU_PAGES, self.MENU_TITLES):
			if page == current:
				div_class = "menu-button menu-button-current"
				link_pre = ""
				link_post = ""
			else:
				div_class = "menu-button"
				link_pre = "<a href=\"" + page + "\">"
				link_post = "</a>"

			result = result + link_pre + "<div class=\"" + div_class + "\">" + title + "</div>" + link_post

		return result

	def build_page(self, page, title):
		source_file = open(os.path.join(self.DIR_TEMPLATES, page))
		source = source_file.read()
		source_file.close()

		result = self.template
		result = result.replace(self.KEY_TITLE, self.TITLE + self.TITLE_DIVISOR + title)
		result = result.replace(self.KEY_DESCRIPTION, self.DESCRIPTION)
		result = result.replace(self.KEY_ADDITIONAL_CSS, "")
		result = result.replace(self.KEY_MENU_BUTTONS, self.build_menu(page))
		result = result.replace(self.KEY_CONTENT, source)
		result = result.replace(self.KEY_POST_SCRIPT, "")
		result = result.replace(self.KEY_META, "")

		file = open(page, "w")
		file.write(compress(result))
		file.close()

	def build_posts(self):
		self.post_links = []

		for index in range(0, len(self.posts)):
			if index == 0:
				next = None
			else:
				next = self.posts[index - 1]

			if index == len(self.posts) - 1:
				previous = None
			else:
				previous = self.posts[index + 1]

			post = self.posts[index]
			if self.exclusive is None or post.get_post_file_name() == self.exclusive:
				self.post_links.append(post.build(previous, next))

	def get_index_count(self):
		return int(math.ceil(float(self.get_post_count()) / self.INDEX_LINKS_PER_PAGE))

	def get_post_count(self):
		return len(self.posts)

	def build_indices(self):
		self.log("Building index for " + str(len(self.post_links)) + " pages")
		self.log_scope_increment()

		for i in range(0, self.get_index_count()):
			self.build_index(i, i * self.INDEX_LINKS_PER_PAGE, min(self.get_post_count(), (i + 1) * self.INDEX_LINKS_PER_PAGE))

		self.log_scope_decrement()

	def get_index_file_name(self, index):
		if index == 0:
			return "index.html"
		else:
			return "index" + str(index) + ".html"

	def get_load_more(self):
		load_more_file = open(os.path.join(self.DIR_TEMPLATES, self.FILE_LOADMORE))
		load_more = load_more_file.read()
		load_more_file.close()

		return load_more

	def build_index(self, index, start ,end):
		if start == end - 1:
			self.log("Building index for post #" + str(start))
		else:
			self.log("Building index for posts #" + str(start) + " to #" + str(end - 1))

		content = ""

		for i in range(start, end):
			content = content + self.post_links[i]

		if index == 0:
			if self.get_index_count() > 1:
				content += self.get_load_more()

			result = self.template
			result = result.replace(self.KEY_TITLE, self.TITLE)
			result = result.replace(self.KEY_DESCRIPTION, self.DESCRIPTION)
			result = result.replace(self.KEY_ADDITIONAL_CSS, "")
			result = result.replace(self.KEY_MENU_BUTTONS, self.build_menu("index.html"))
			result = result.replace(self.KEY_CONTENT, content)
			result = result.replace(self.KEY_POST_SCRIPT, self.SCRIPT_LOAD_MORE)
			result = result.replace(self.KEY_META, "")
		else:
			result = content

		file = open(self.get_index_file_name(index), "w")
		file.write(compress(result))
		file.close()

	def log(self, message):
		print('\t' * self.log_scope + message)

	def log_scope_increment(self):
		self.log_scope = self.log_scope + 1

	def log_scope_decrement(self):
		self.log_scope = self.log_scope - 1

	def read_template(self):
		template_file = open(os.path.join(self.DIR_TEMPLATES, self.FILE_TEMPLATE))
		template = template_file.read()
		template_file.close()

		return template

	def abort(self):
		self.log("Aborting...")
		sys.exit()

	def validate_requirements(self):
		if not os.path.isfile(os.path.join(self.DIR_TEMPLATES, self.FILE_TEMPLATE)):
			self.log(self.FILE_TEMPLATE + " was not found")
			self.abort()

		if not os.path.isfile(os.path.join(self.DIR_TEMPLATES, self.FILE_LOADMORE)):
			self.log(self.FILE_LOADMORE + + " was not found")
			self.abort()

		if not os.path.isdir(self.DIR_POSTS):
			self.log("Directory " + self.DIR_POSTS + " was not found")
			self.abort()

		if not os.path.isdir(self.DIR_JAVASCRIPT):
			self.log("Directory " + self.DIR_JAVASCRIPT + " was not found")
			self.abort()

	def get_posts(self):
		directories = [dir for dir in listdir(self.DIR_POSTS)]
		directories.sort(key=lambda x: datetime.datetime.strptime(x, '%Y_%m_%d'), reverse=True)

		return [Post(self, dir) for dir in directories]

def main():
	site = None

	if len(argv) > 1:
		if argv[1] == "clean":
			Site.clean()

			return
		else:
			site = Site(argv[1])

	if site is None:
		site = Site()
		site.clean()

	site.build()

if __name__ == "__main__":
	main()
