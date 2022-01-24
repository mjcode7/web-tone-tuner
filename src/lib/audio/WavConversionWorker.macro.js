import { createMacro } from 'babel-plugin-macros';
import {Environment} from 'utils/Environment';

function macro({ references, state, babel }) {
  state.file.path.node.body.forEach(node => {
    if (node.type === 'ImportDeclaration') {
      const publicPath = Environment.isDev() ? '' : '/js/workers/';
      node.source.value = `worker-loader!./WavConversion.worker?{'publicPath': '${publicPath}'}`;
    }
  });

  return { keepImports: true };
}

export default createMacro(macro);