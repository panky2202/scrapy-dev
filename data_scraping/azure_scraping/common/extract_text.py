from statistics import median


def box_intersection_area(box1, box2):
    """
    >>> box_intersection_area((0, 0, 10, 20), (5, 10, 1, 50))
    10
    """
    l1, t1, w1, h1 = box1
    l2, t2, w2, h2 = box2

    dx = min(l1 + w1, l2 + w2) - max(l1, l2)
    dy = min(t1 + h1, t2 + h2) - max(t1, t2)
    if (dx >= 0) and (dy >= 0):
        return dx * dy

    return 0.0


def get_line_height(boxes):
    return median(h for _, _, _, _, h in boxes)


def assign_boxes_to_lines(boxes):
    """
    >>> my_ocr = [
    ... ['ITEM', 0.193, 0.276, 0.029, 0.007],
    ... ['UPC', 0.193, 0.311, 0.026, 0.008],
    ... ['874619-54093-2', 0.255, 0.31, 0.107, 0.009],
    ... ['VOLUME:', 0.39, 0.325, 0.059, 0.008],
    ... ]
    >>> assign_boxes_to_lines(my_ocr)
    [['ITEM', 0.193, 1, 0.029, 0.007], ['874619-54093-2', 0.255, 2, 0.107, 0.009], ['UPC', 0.193, 2, 0.026, 0.008], ['VOLUME:', 0.39, 3, 0.059, 0.008]]
    """
    line = 1
    sorted_boxes = sorted(boxes, key=lambda x: x[2])
    line_height = get_line_height(sorted_boxes)
    results = []
    last_top = 0
    line_break = line_height / 5
    for text, l, t, w, h in sorted_boxes:
        if last_top and abs(t - last_top) > line_break:
            line += 1
        results.append([text, l, line, w, h])
        last_top = t

    return results


def extract_text_from_region(ocr, region=None):
    """
    >>> my_ocr = [
    ... ('world', 0.066, 0.058, 0.010, 0.010),
    ... ('outside', 0.034, 0.018, 0.010, 0.010),
    ... ('hello', 0.032, 0.059, 0.010, 0.010),
    ... ('second line', 0.034, 0.079, 0.010, 0.010),
    ... ('outside', 0.032, 0.0117, 0.010, 0.010),
    ... ]
    >>> my_region = (0.023, 0.048, 0.084, 0.050)
    >>> extract_text_from_region(my_ocr, my_region)
    'hello world\\nsecond line'

    >>> my_ocr = [
    ... ('world', 0.066, 0.058, 0.010, 0.010),
    ... ('outside', 0.034, 0.018, 0.010, 0.010),
    ... ('hello', 0.032, 0.059, 0.010, 0.010),
    ... ('second line', 0.034, 0.079, 0.010, 0.010),
    ... ('outside', 0.032, 0.0117, 0.010, 0.010),
    ... ]
    >>> extract_text_from_region(my_ocr)
    'outside\\noutside\\nhello world\\nsecond line'
    """

    def is_in_region(box):
        if not region:
            return True
        return box_intersection_area(region, box) > 0.0

    text_box_in_region = [
        text_box for text_box in ocr if text_box[0] and is_in_region(text_box[1:])
    ]

    if not text_box_in_region:
        return

    line_text_box = assign_boxes_to_lines(text_box_in_region)

    sorted_text_box_in_region = sorted(line_text_box, key=lambda x: (x[2], x[1]))

    result = ''
    last_line = 0
    for text, left, top, w, h in sorted_text_box_in_region:
        if last_line is not None and top > last_line:
            result = result.strip() + '\n'
        result += text + ' '
        last_line = top

    return result.strip()
