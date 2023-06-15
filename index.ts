import { compile, defineComponent } from 'vue'
import { Text, View, PDFDocumentElement } from './elements'
import { createApp } from './renderer'
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

const app = createApp(App)
app.mount(new PDFDocumentElement())
