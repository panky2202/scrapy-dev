from urllib.request import urlopen
from bs4 import BeautifulSoup


def parse_xml(url):
    """This function should parse a xml from the web

    >>> parse_xml("https://www.w3schools.com/xml/note.xml")
    <?xml version="1.0" encoding="UTF-8"?><html><body><note>
    <to>Tove</to>
    <from>Jani</from>
    <heading>Reminder</heading>
      Don't forget me this weekend!
    </note></body></html>
    """
    url_response = urlopen(url)
    xml_content = url_response.read()
    return BeautifulSoup(xml_content, 'lxml')