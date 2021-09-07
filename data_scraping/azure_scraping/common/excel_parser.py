import pandas as pd
from numpy.lib import math


def set_header(df):
    """
        >>> data = pd.DataFrame([
        ... ['Col1', 'Col2', 'Col3'],
        ... ['1', 'Data2', 'Data3'],
        ... ['2', 'Data4', 'Data5']])
        >>> set_header(data)
          Col1   Col2   Col3
        0    1  Data2  Data3
        1    2  Data4  Data5
        """
    col_names = df.iloc[0].values
    df = df.iloc[1:]
    df = pd.DataFrame(df.values, columns=col_names)
    df = df.astype(dtype='str')
    return df


def remove_garbage(df, header_marker=None, bottom_marker=None):
    """
    >>> data = pd.DataFrame([['This', 'is', 'Garbage'],
    ... ['Col1', 'Col2', 'Col3'],
    ... ['Data1', 'Data2', 'Data3'],
    ... [math.nan, math.nan, math.nan],
    ... [None, None, 'Total'],
    ... [None, None, 'Subtotal']])
    >>> remove_garbage(data, 'Col1', 'Total')
           0      1      2
    1   Col1   Col2   Col3
    2  Data1  Data2  Data3
    """
    df.dropna(inplace=True, how='all')
    if header_marker or bottom_marker:
        for index, row in df.iterrows():
            if header_marker and header_marker in row.values:
                df.drop([i for i, row in df.iterrows() if i < index], axis=0, inplace=True)
            if bottom_marker and bottom_marker in row.values:
                df.drop([i for i, row in df.iterrows() if i >= index], axis=0, inplace=True)
    return df


def excel_parser(excel_url, extract_product_from_data, header_marker=None, bottom_marker=None):
    xl = pd.ExcelFile(excel_url)
    for sht in xl.sheet_names:
        df = pd.read_excel(xl, sheet_name=sht, dtype='str', header=None)
        df = remove_garbage(df, header_marker, bottom_marker)

        if df.empty:
            return

        if header_marker:
            df = remove_garbage(df, header_marker)
        df = set_header(df)

        # Loop lines and extract products
        for index, row in df.iterrows():
            product = extract_product_from_data(row)
            yield product
