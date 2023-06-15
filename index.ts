import { createRenderer, compile, defineComponent } from 'vue'
import { nodeOps } from './nodeOps'
import { Text, View, PDFDocumentElement } from './elements'
import { renderDocument } from './renderer'
const App = defineComponent({
  components: { Text, View },
  data() {
    return {
      colors: ['pink', 'blue', 'green'],
    }
  },
  render: compile(`
      <View>
        <View :styles="{color: 'red'}">
          <Text v-for="color in colors" :styles="{color}">
            {{ color }}
          </Text>
          <Text>Red</Text>
        </View>
        <Text>Default</Text>
        <Text :styles="{color: 'yellow'}">Yellow</Text>
      </View>
      `),
})

const { createApp } = createRenderer(nodeOps)

const app = createApp(App)
const vm = app.mount(new PDFDocumentElement())

renderDocument('file')
