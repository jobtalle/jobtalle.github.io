import json
import math
import os.path

from os import listdir

TITLE = "Job Talle"
TITLE_DIVISOR = " | "

DIR_POSTS = "posts"
DIR_CSS = "css"
DIR_JAVASCRIPT = "js"

FILE_CONTENT = "content.html"
FILE_PROPERTIES = "properties.json"
FILE_TEMPLATE = "template.html"

KEY_TITLE = "$title$"
KEY_ADDITIONAL_CSS = "$additional-css$"
KEY_CONTENT = "$content$"

PROPERTY_TITLE = "title"
PROPERTY_DESCRIPTION = "description"

INDEX_LINKS_PER_PAGE = 2

log_scope = 0
template = 0
post_links = []

def log(message):
	print('\t' * log_scope + message)
	
def log_scope_increment():
	global log_scope
	log_scope = log_scope + 1
	
def log_scope_decrement():
	global log_scope
	log_scope = log_scope - 1

def get_post_directories():
	directories = [dir for dir in listdir(DIR_POSTS)]
	directories.sort()
	
	return directories
	
def get_post_file_name(title):
	return title.replace(" ", "_").lower() + ".html"
	
def make_post_link(title, description, url):
	return "<div id=\"post-link\"><h1><a href=\"" + url + "\">" + title + "</a></h1><p>" + description + "</p></div>";
	
def build_directory(directory):
	# Infer source files
	content = os.path.join(DIR_POSTS, directory, FILE_CONTENT)
	properties = os.path.join(DIR_POSTS, directory, FILE_PROPERTIES)
	
	# Check post validity
	if not os.path.isfile(content):
		log("Post " + directory + " has no " + FILE_CONTENT)
		
		return
		
	if not os.path.isfile(properties):
		log("Post " + directory + " has no " + FILE_PROPERTIES)
		
		return
	
	# Load post properties
	properties_file = open(properties);
	properties = json.load(properties_file)
	properties_file.close();
	log("Building " + get_post_file_name(properties[PROPERTY_TITLE]))
	
	# Mutate template
	result = template
	result = result.replace(KEY_TITLE, TITLE + TITLE_DIVISOR + properties[PROPERTY_TITLE])
	result = result.replace(KEY_ADDITIONAL_CSS, "");
	
	# Write content
	contentFile = open(content);
	result = result.replace(KEY_CONTENT, contentFile.read());
	contentFile.close();
	
	# Write result to file
	file = open(get_post_file_name(properties[PROPERTY_TITLE]), "w");
	file.write(result);
	file.close();
	
	# Add link
	global post_links;
	post_links.append(make_post_link(properties[PROPERTY_TITLE], properties[PROPERTY_DESCRIPTION], get_post_file_name(properties[PROPERTY_TITLE])));
	
def build_index(index, start ,end):
	if start == end - 1:
		log("Building index for post #" + str(start))
	else:
		log("Building index for posts #" + str(start) + " to #" + str(end - 1))
	
	global post_links
	content = ""
	
	for i in range(start, end):
		content = content + post_links[i];
		
	result = template
	result = result.replace(KEY_TITLE, TITLE)
	result = result.replace(KEY_ADDITIONAL_CSS, "")
	result = result.replace(KEY_CONTENT, content)
	
	if index == 0:
		file_name = "index.html"
	else:
		file_name = "index_" + str(i) + ".html"
		
	file = open(file_name, "w")
	file.write(result)
	file.close()
	
def build():
	if not os.path.isfile(FILE_TEMPLATE):
		log(FILE_TEMPLATE + " was not found")
		
		return
		
	global template
	template = open(FILE_TEMPLATE).read()

	log("Starting build")
	log_scope_increment()
	
	# Build pages
	for directory in get_post_directories():
		build_directory(directory)
	
	# Build index
	global post_links
	log("Building index for " + str(len(post_links)) + " pages")
	log_scope_increment()
	
	for i in range(0, int(math.ceil(float(len(post_links)) / INDEX_LINKS_PER_PAGE))):
		build_index(i, i * INDEX_LINKS_PER_PAGE, min(len(post_links), (i + 1) * INDEX_LINKS_PER_PAGE))
	
	log_scope_decrement()
	log_scope_decrement()
	log("Done")

build()