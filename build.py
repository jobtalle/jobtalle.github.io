import json
import math
import sys
import os.path

from sys import argv
from os import listdir


class Post:
	FILE_CONTENT = "content.html"
	FILE_PROPERTIES = "properties.json"
	
	PROPERTY_TITLE = "title"
	PROPERTY_ABSTRACT = "abstract"
	PROPERTY_PREVIEW = "preview"
	
	CLASS_POST_LINK = "post-link"
	
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
		self.content = os.path.join(Site.DIR_POSTS, directory, self.FILE_CONTENT)
		self.properties = os.path.join(Site.DIR_POSTS, directory, self.FILE_PROPERTIES)
		
		self.validate_requirements()
		self.read_properties()
		
	def build(self):
		self.site.log("Building " + self.get_post_file_name())
	
		result = self.site.template
		result = result.replace(self.site.KEY_TITLE, self.site.TITLE + self.site.TITLE_DIVISOR + self.properties[self.PROPERTY_TITLE])
		result = result.replace(self.site.KEY_ADDITIONAL_CSS, "")
		result = result.replace(self.site.KEY_ADDITIONAL_JAVASCRIPT, "")
		result = result.replace(self.site.KEY_CONTENT_FOOTER, "")
		result = result.replace(self.site.KEY_MENU_BUTTONS, self.site.build_menu())
		
		contentFile = open(self.content)
		result = result.replace(self.site.KEY_CONTENT, self.get_post_header(self.properties[self.PROPERTY_TITLE]) + contentFile.read())
		contentFile.close()
		
		file = open(self.get_post_file_name(), "w")
		file.write(result)
		file.close()
		
		return self.make_post_link(self.properties[self.PROPERTY_TITLE], self.properties[self.PROPERTY_ABSTRACT], self.get_post_file_name())
			
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
		month = self.MONTH_ABBREVIATIONS[int(parts[1])]
		day = parts[2]
		
		return str(day) + " " + month + " " + str(year)
		
	def get_post_header(self, title, url=None):
		if url is None:
			link_open = ""
			link_close = ""
		else:
			link_open = "<a href=\"" + url + "\">"
			link_close = "</a>"
	
		return "<h1>" + link_open + title + link_close + "</h1><span class=\"date\">" + self.get_date() + "</span><p>";
		
	def get_post_file_name(self):
		return self.properties[self.PROPERTY_TITLE].replace(" ", "_").lower() + ".html"
		
	def get_preview(self):
		return os.path.join(self.site.DIR_POSTS, self.directory, self.properties[self.PROPERTY_PREVIEW])
		
	def make_post_link(self, title, abstract, url):
		return "<div class=\"" + self.CLASS_POST_LINK + "\"><a href=\"" + url + "\"><img src=\"" + self.get_preview() + "\" title=\"" + self.properties[self.PROPERTY_TITLE] + "\"></a>" + self.get_post_header(title, url) + abstract + "</p></div>"
	
	
class Site:
	TITLE = "Job Talle"
	TITLE_DIVISOR = " | "

	DIR_POSTS = "posts"
	DIR_CSS = "css"
	DIR_JAVASCRIPT = "js"
	DIR_TEMPLATES = "templates"
	
	FILE_TEMPLATE = "template.html"
	FILE_LOADMORE = "loadmore.html"

	KEY_TITLE = "$title$"
	KEY_ADDITIONAL_CSS = "$additional-css$"
	KEY_ADDITIONAL_JAVASCRIPT = "$additional-javascript$"
	KEY_MENU_BUTTONS = "$menu-buttons$"
	KEY_CONTENT = "$content$"
	KEY_CONTENT_FOOTER = "$content-footer$"

	INDEX_LINKS_PER_PAGE = 6
	
	ID_LOAD_MORE = "load-more"
	
	MENU_PAGES = [
		"index.html",
		"about.html",
		"contact.html"
	]
	MENU_TITLES = [
		"Home",
		"About",
		"Contact"
	]

	def __init__(self):
		self.validate_requirements()
		
		self.log_scope = 0
		self.log("Analyzing sources")
		self.template = self.read_template()
		self.posts = self.get_posts()
		
	def clean(self):
		for post in self.posts:
			file_name = post.get_post_file_name()
			
			if os.path.isfile(file_name):
				os.remove(file_name)
				
		for index in range(0, self.get_index_count()):
			if os.path.isfile(self.get_index_file_name(index)):
				os.remove(self.get_index_file_name(index))
				
		if os.path.isfile(self.get_about_file_name()):
			os.remove(self.get_about_file_name())
		
	def build(self):
		self.log("Starting build")
		self.log_scope_increment()
		
		self.build_posts()
		self.build_indices()
		
		for index in range(1, len(self.MENU_PAGES)):
			self.build_page(self.MENU_PAGES[index], self.MENU_TITLES[index])
			
		self.log_scope_decrement()
		self.log("Done")
		
	def build_menu(self, current = None):
		result = ""
		
		for page, title in zip(self.MENU_PAGES, self.MENU_TITLES):
			if page == current:
				div_class = "menu-button-current"
				link_pre = ""
				link_post = ""
			else:
				div_class = "menu-button"
				link_pre = "<a href=\"" + page + "\">"
				link_post = "</a>"
		
			result = result + link_pre + "<div class=\"" + div_class + "\" title=\"" + title + "\">" + title + "</div>" + link_post
			
		return result
	
	def build_page(self, page, title):
		source_file = open(os.path.join(self.DIR_TEMPLATES, page))
		source = source_file.read()
		source_file.close()
	
		result = self.template
		result = result.replace(self.KEY_TITLE, self.TITLE + self.TITLE_DIVISOR + title)
		result = result.replace(self.KEY_ADDITIONAL_CSS, "")
		result = result.replace(self.KEY_ADDITIONAL_JAVASCRIPT, "")
		result = result.replace(self.KEY_MENU_BUTTONS, self.build_menu(page))
		result = result.replace(self.KEY_CONTENT, source)
		result = result.replace(self.KEY_CONTENT_FOOTER, "")
			
		file = open(page, "w")
		file.write(result)
		file.close()
	
	def build_posts(self):
		self.post_links = []
	
		for post in self.posts:
			self.post_links.append(post.build())
		
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
			result = self.template
			result = result.replace(self.KEY_TITLE, self.TITLE)
			result = result.replace(self.KEY_ADDITIONAL_CSS, "")
			result = result.replace(self.KEY_ADDITIONAL_JAVASCRIPT, "<script src=\"js/loadmore.js\"></script>")
			result = result.replace(self.KEY_MENU_BUTTONS, self.build_menu("index.html"))
			result = result.replace(self.KEY_CONTENT, content)
			
			if self.get_index_count() == 1:
				result = result.replace(self.KEY_CONTENT_FOOTER, "")
			else:
				result = result.replace(self.KEY_CONTENT_FOOTER, self.get_load_more())
		else:
			result = content
			
		file = open(self.get_index_file_name(index), "w")
		file.write(result)
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
			
		if not os.path.isdir(self.DIR_CSS):
			self.log("Directory " + self.DIR_CSS + " was not found")
			self.abort()
			
		if not os.path.isdir(self.DIR_JAVASCRIPT):
			self.log("Directory " + self.DIR_JAVASCRIPT + " was not found")
			self.abort()
			
	def get_posts(self):
		directories = [dir for dir in listdir(self.DIR_POSTS)]
		directories.sort()
		
		return [Post(self, dir) for dir in directories]

def main():
	site = Site()
	
	if len(argv) > 1 and argv[1] == "clean":
		site.clean()
	else:
		site.build()
	
if __name__ == "__main__":
	main()