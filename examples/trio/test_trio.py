import unittest

from roman import from_roman, to_roman
from slug import slugify
from wordfreq import top_words


class SlugTest(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(slugify("Hello, World!"), "hello-world")

    def test_spaces_and_dashes(self):
        self.assertEqual(slugify("  many   spaces -- and dashes "), "many-spaces-and-dashes")

    def test_accents(self):
        self.assertEqual(slugify("Canción Ñandú"), "cancion-nandu")

    def test_empty(self):
        self.assertEqual(slugify("!!!"), "")


class RomanTest(unittest.TestCase):
    def test_round_trip(self):
        for n in range(1, 4000):
            self.assertEqual(from_roman(to_roman(n)), n)

    def test_known(self):
        self.assertEqual(to_roman(1994), "MCMXCIV")
        self.assertEqual(to_roman(3999), "MMMCMXCIX")
        self.assertEqual(from_roman("XLII"), 42)

    def test_out_of_range(self):
        for n in (0, 4000, -1):
            with self.assertRaises(ValueError):
                to_roman(n)

    def test_invalid_numeral(self):
        for s in ("", "IIII", "IC", "ABC", "VV"):
            with self.assertRaises(ValueError):
                from_roman(s)


class WordFreqTest(unittest.TestCase):
    def test_top(self):
        text = "the cat and the hat. The CAT sat!"
        self.assertEqual(top_words(text, 2), [("the", 3), ("cat", 2)])

    def test_ties_alphabetical(self):
        self.assertEqual(top_words("b a c b a c", 3), [("a", 2), ("b", 2), ("c", 2)])

    def test_apostrophes(self):
        self.assertEqual(top_words("don't stop, don't", 1), [("don't", 2)])

    def test_n_larger_than_vocabulary(self):
        self.assertEqual(top_words("one", 5), [("one", 1)])


if __name__ == "__main__":
    unittest.main()
