import os


def build_image_generator(name: str, rate_limiter=None):
    """
    Instantiate the correct image generator by name.

    Supported names:
      - 'google'           → ImageGeneratorNanobananaGoogleAPI
      - 'yunwu_nanobanana' → ImageGeneratorNanobananaYunwuAPI
      - 'yunwu_doubao'     → ImageGeneratorDoubaoSeedreamYunwuAPI
      - 'doubao' / 'seedream' → ImageGeneratorDoubaoSeedreamYunwuAPI
      - 'freepik'          → ImageGeneratorFreepikMysticAPI
    """
    if name == "freepik":
        from tools.image_generator_freepik_mystic_api import ImageGeneratorFreepikMysticAPI
        api_key = os.getenv("FREEPIK_API_KEY")
        if not api_key:
            raise ValueError("FREEPIK_API_KEY environment variable is required")
        return ImageGeneratorFreepikMysticAPI(api_key=api_key, rate_limiter=rate_limiter)

    if name in ("yunwu_doubao", "doubao", "seedream"):
        from tools.image_generator_doubao_seedream_yunwu_api import ImageGeneratorDoubaoSeedreamYunwuAPI
        api_key = os.getenv("YUNWU_API_KEY") or os.getenv("DOUBAO_API_KEY")
        if not api_key:
            raise ValueError("YUNWU_API_KEY environment variable is required for Doubao")
        return ImageGeneratorDoubaoSeedreamYunwuAPI(api_key=api_key)

    if name == "yunwu_nanobanana":
        from tools.image_generator_nanobanana_yunwu_api import ImageGeneratorNanobananaYunwuAPI
        api_key = os.getenv("YUNWU_API_KEY")
        if not api_key:
            raise ValueError("YUNWU_API_KEY environment variable is required for Yunwu Nanobanana")
        return ImageGeneratorNanobananaYunwuAPI(api_key=api_key, rate_limiter=rate_limiter)

    from tools.image_generator_nanobanana_google_api import ImageGeneratorNanobananaGoogleAPI
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    return ImageGeneratorNanobananaGoogleAPI(api_key=api_key, rate_limiter=rate_limiter)
