import json
import os.path

from os import listdir

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

log_scope = 0
template = 0

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
	result = result.replace(KEY_TITLE, properties[PROPERTY_TITLE])
	result = result.replace(KEY_ADDITIONAL_CSS, "");
	
	# Write content
	contentFile = open(content);
	result = result.replace(KEY_CONTENT, contentFile.read());
	contentFile.close();
	
	# Write result to file
	file = open(get_post_file_name(properties[PROPERTY_TITLE]), "w");
	file.write(result);
	file.close();
	
def build():
	if not os.path.isfile(FILE_TEMPLATE):
		log(FILE_TEMPLATE + " was not found")
		
		return
		
	global template
	template = open(FILE_TEMPLATE).read()

	log("Starting build")
	log_scope_increment()
	
	for directory in get_post_directories():
		build_directory(directory)
	
	log_scope_decrement()
	log("Done")

	
build()