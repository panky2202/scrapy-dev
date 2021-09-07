from typing import Dict, Tuple, List

SPACE = 0.006

ColumnName = str
DltLeft = float
DltWidth = float
CustomColumn = Dict[ColumnName, Tuple[DltLeft, DltWidth]]


def group_cell_words(column_markers, row_words):
    """
    >>> group_cell_words([[1,1], [2,1], [3,1], [4,1]],
    ... [['Lol', 1], ['Internet', 1], ['Col2', 2], ['Col3', 3], ['Col', 4], ['4', 4]])
    ['Lol Internet', 'Col2', 'Col3', 'Col 4']
    """
    row_cells = []
    for column_marker, width in column_markers:
        cell = ''
        for col_word, marker in row_words:
            if marker == column_marker:
                cell = cell + col_word + ' '
        row_cells.append(cell.strip())
    return row_cells


def word_intersects_header(column_marker, left, width):
    """
    Check if a word intersects with a header marker
    >>> word_intersects_header([1,3], 0.5, 3)
    True

    >>> word_intersects_header([1,3], 0.4, 0.5)
    False
    """
    return (left - 2 * SPACE <= column_marker[0] <= left + width + 2 * SPACE) \
           or (column_marker[0] - 2 * SPACE <= left <= column_marker[0] + column_marker[1] + 2 * SPACE)


def lost_word_follows_cell_word(column_word, left, last_word_right):
    """
    Check if a lost word follows a word that belongs to a column
    >>> lost_word_follows_cell_word(None, 0.084, 0.08)
    True

    >>> lost_word_follows_cell_word(['Foo', 0.1], 0.1, 0.08)
    False

    >>> lost_word_follows_cell_word(None, 0.1, 0.01)
    False
    """
    return round(last_word_right + SPACE / 2, 3) <= left <= round(last_word_right + SPACE, 3) \
           and not column_word


def group_line_words(ocr, row_tops, column_markers):
    """
        >>> group_line_words([
        ... ['WORD1', 1, 10, 2, 2],
        ... ['WORD2', 10, 10, 2, 2],
        ... ['WORD3', 20, 10, 2, 2]],
        ... [10],
        ... [[1, 2], [10, 2], [20, 2]])
        ['WORD1|WORD2|WORD3']
        """
    row_list = []
    for rt in row_tops:
        row_words = []
        lost_words = []
        last_marker = 0
        last_word_right = 0
        for word, left, top, width, height in ocr:
            if rt - SPACE <= top <= rt + SPACE:
                column_word = None
                for column_marker in column_markers:
                    if word_intersects_header(column_marker, left, width):
                        for lw in lost_words:
                            if lw[1] + SPACE >= left:
                                word = lost_words.pop(lost_words.index(lw))[0] + " " + word
                        column_word = [word, column_marker[0]]
                        last_marker = column_marker[0]
                        last_word_right = left + width
                        break
                if lost_word_follows_cell_word(column_word, left, last_word_right):
                    column_word = [word, last_marker]
                    last_word_right = left + width
                elif not column_word:
                    if not lost_words:
                        lost_words.append([word, left + width])
                    else:
                        for lw in lost_words:
                            if lw[1] + SPACE >= left:
                                word = lost_words.pop(lost_words.index(lw))[0] + " " + word
                                lost_words.append([word, left + width])
                                break
                        lost_words.append([word, left + width])

                if column_word:
                    row_words.append(column_word)

        row_cells = group_cell_words(column_markers, row_words)

        if row_cells:
            row_list.append('|'.join(row_cells))

    return row_list


def remove_approx_row_tops(row_tops):
    """
    >>> remove_approx_row_tops([0.003, 0.005, 0.007])
    [0.003]
    """
    remove_list = []
    for rt in row_tops:
        for rt2 in row_tops:
            if rt < rt2 <= rt + SPACE:
                remove_list.append(rt2)
            elif rt2 > rt + SPACE:
                break
    for rt in remove_list:
        if rt in row_tops:
            row_tops.remove(rt)

    return row_tops


def find_marker(ocr, marker_word):
    """
    >>> find_marker([['LOL', 1, 1, 2, 2], ['INTERNET', 1, 1, 2, 2]], 'INTERNET')
    1
    >>> find_marker([['LOL', 1, 1, 2, 2], ['INTERNET', 1, 1, 2, 2]], ('LOL2', 'INTERNET'))
    1
    """
    for word, left, top, width, height in ocr:
        if isinstance(marker_word, str):
            if word == marker_word:
                return top
        else:
            for marker in marker_word:
                if word == marker:
                    return top


def find_table_column_markers(ocr, table_header_marker, column_names, custom_columns: CustomColumn = None):
    """
    >>> find_table_column_markers([
    ... ['COL1', 1, 1, 2, 2],
    ... ['COL2', 10, 1, 2, 2],
    ... ['COL3', 20, 1, 2, 2]],
    ... 1, ['COL1', 'COL2', 'COL3'])
    [[1, 2], [10, 2], [20, 2]]
    >>> find_table_column_markers([
    ... ['COL1', 1, 1, 2, 2],
    ... ['COL2', 10, 1, 2, 2],
    ... ['COL3', 20, 1, 2, 2]],
    ... 1, ['COL1', 'COL2', 'COL3'],
    ... custom_columns={'COL2': (-0.3, 0.4)})
    [[1, 2], [9.7, 2.4], [20, 2]]
    """
    column_markers = []
    for word, _left, top, _width, height in ocr:
        if table_header_marker <= top <= table_header_marker + SPACE:
            if word in column_names:
                dlt_left, dtl_width = (
                    custom_columns[word]
                    if custom_columns and (word in custom_columns) else
                    (0, 0)
                )
                column_markers.append([_left + dlt_left, _width + dtl_width])
    return column_markers


def get_row_tops(ocr, table_header_marker, table_end_marker):
    """
    >>> get_row_tops([
    ... ['ROW1', 0.1, 0.5, 0.2, 0.2],
    ... ['ROW2', 0.1, 0.10, 0.2, 0.2],
    ... ['ROW3', 0.1, 0.2, 0.2, 0.2]],
    ... 0.1, 0.3)
    [0.2]

    >>> get_row_tops([
    ... ['ROW1', 0.1, 0.5, 0.2, 0.2],
    ... ['ROW2', 0.1, 0.10, 0.2, 0.2],
    ... ['ROW3', 0.1, 0.20, 0.2, 0.2]],
    ... 0.1, 1)
    [0.2, 0.5]
    """

    row_tops = [top for word, left, top, width, height in ocr if table_header_marker < top < table_end_marker]
    row_tops = list(dict.fromkeys(row_tops))
    row_tops.sort()
    row_tops = remove_approx_row_tops(row_tops)
    return row_tops


def group_multiple_lines(row_list, main_col=0):
    """
    Detects and groups cell words that span in multiple lines
    >>> group_multiple_lines([
    ... '1|1234|Description|123456789',
    ... '||Line2|'])
    [['1', '1234', 'Description Line2', '123456789']]

    >>> group_multiple_lines([
    ... '1|1234|Description|123456789',
    ... '|abc|Line2|'])
    [['1', '1234 abc', 'Description Line2', '123456789']]

    >>> group_multiple_lines([
    ... '1|1234|Description|123456789',
    ... '2|54678|Description2|456987456'])
    [['1', '1234', 'Description', '123456789'], ['2', '54678', 'Description2', '456987456']]

    >>> group_multiple_lines([
    ... '1|1234|Description|123456789',
    ... 'A|B||'], 2)
    [['1 A', '1234 B', 'Description', '123456789']]
    """
    last_data = []
    grouped_rows = []
    for row in row_list:
        data = row.split('|')
        if data[main_col] == '' and last_data:
            for i in range(0, len(data) - 1):
                last_data[i] = last_data[i] + ' ' + data[i] if data[i] != '' else last_data[i]
        else:
            if last_data:
                grouped_rows.append(last_data)
            last_data = data
    grouped_rows.append(last_data)

    return grouped_rows


def table_parser(
        pages,
        extract_product_from_data,
        header_marker,
        column_names: List[ColumnName],
        end_marker=None,
        first_page=None,
        main_col=0,
        custom_columns: CustomColumn = None
):
    for page_image, ocr in pages:
        # Get markers
        if first_page:
            table_header_marker = find_marker(first_page[0][1], header_marker)
            column_markers = find_table_column_markers(first_page[0][1], table_header_marker, column_names,
                                                       custom_columns)
        else:
            table_header_marker = find_marker(ocr, header_marker)
            column_markers = find_table_column_markers(ocr, table_header_marker, column_names, custom_columns)
        table_end_marker = find_marker(ocr, end_marker) if end_marker else 1
        table_end_marker = table_end_marker - SPACE if table_end_marker else 1
        # Get every row top position
        row_tops = get_row_tops(ocr, table_header_marker, table_end_marker)
        # Get a list containing row texts
        row_list = group_line_words(ocr, row_tops, column_markers)
        product_list = group_multiple_lines(row_list, main_col)
        # Loop lines and extract products
        for product in product_list:
            try:
                product_image = ''
                product = extract_product_from_data(product)
                yield product_image, product
            except:
                pass
