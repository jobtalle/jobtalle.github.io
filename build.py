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
	PROPERTY_DESCRIPTION = "description"
	
	ID_POST_LINK = "post-link"

	def __init__(self, site, directory):
		self.site = site
		self.directory = directory
		self.content = os.path.join(Site.DIR_POSTS, directory, self.FILE_CONTENT)
		self.properties = os.path.join(Site.DIR_POSTS, directory, self.FILE_PROPERTIES)
		
		self.validate_requirements()
		self.read_properties()
		
	def build(self):
		self.site.log("Building " + self.get_post_file_name())
	
		# Mutate template
		result = self.site.template
		result = result.replace(self.site.KEY_TITLE, self.site.TITLE + self.site.TITLE_DIVISOR + self.properties[self.PROPERTY_TITLE])
		result = result.replace(self.site.KEY_ADDITIONAL_CSS, "");
		result = result.replace(self.site.KEY_ADDITIONAL_JAVASCRIPT, "");
		
		# Write content
		contentFile = open(self.content);
		result = result.replace(self.site.KEY_CONTENT, contentFile.read());
		contentFile.close();
		
		# Write result to file
		file = open(self.get_post_file_name(), "w");
		file.write(result);
		file.close();
		
		return self.make_post_link(self.properties[self.PROPERTY_TITLE], self.properties[self.PROPERTY_DESCRIPTION], self.get_post_file_name());
			
	def validate_requirements(self):
		if not os.path.isfile(self.content):
			self.site.log("Post " + self.directory + " has no " + self.FILE_CONTENT)
			self.site.abort()
			
		if not os.path.isfile(self.properties):
			self.site.log("Post " + self.directory + " has no " + self.FILE_PROPERTIES)
			self.site.abort()
			
	def read_properties(self):
		properties_file = open(self.properties);
		self.properties = json.load(properties_file)
		properties_file.close();
		
	def get_post_file_name(self):
		return self.properties[self.PROPERTY_TITLE].replace(" ", "_").lower() + ".html"
		
	def make_post_link(self, title, description, url):
		return "<div id=\"" + self.ID_POST_LINK + "\"><h1><a href=\"" + url + "\">" + title + "</a></h1><p>" + description + "</p></div>"
	
	
class Site:
	TITLE = "Job Talle"
	TITLE_DIVISOR = " | "

	DIR_POSTS = "posts"
	DIR_CSS = "css"
	DIR_JAVASCRIPT = "js"

	FILE_TEMPLATE = "template.html"

	KEY_TITLE = "$title$"
	KEY_ADDITIONAL_CSS = "$additional-css$"
	KEY_ADDITIONAL_JAVASCRIPT = "$additional-javascript$"
	KEY_CONTENT = "$content$"

	INDEX_LINKS_PER_PAGE = 2

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
		
	def build(self):
		self.log("Starting build")
		self.log_scope_increment()
		
		self.build_directories()
		self.build_indices()
			
		self.log_scope_decrement()
		self.log("Done")
	
	def build_directories(self):
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
		
	def build_index(self, index, start ,end):
		if start == end - 1:
			self.log("Building index for post #" + str(start))
		else:
			self.log("Building index for posts #" + str(start) + " to #" + str(end - 1))
		
		content = ""
		
		for i in range(start, end):
			content = content + self.post_links[i];
			
		result = self.template
		result = result.replace(self.KEY_TITLE, self.TITLE)
		result = result.replace(self.KEY_ADDITIONAL_CSS, "")
		result = result.replace(self.KEY_CONTENT, content)
			
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
		template_file = open(self.FILE_TEMPLATE);
		template = template_file.read();
		template_file.close();
		
		return template
	
	def abort(self):
		self.log("Aborting...")
		sys.exit()
	
	def validate_requirements(self):
		if not os.path.isfile(self.FILE_TEMPLATE):
			self.log(self.FILE_TEMPLATE + " was not found")
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