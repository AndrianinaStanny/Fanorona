module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        [
          'babel-preset-expo',
          {
            // Désactive le compilateur React (évite react-compiler-runtime)
            reactCompiler: false,
          },
        ],
      ],
    };
  };