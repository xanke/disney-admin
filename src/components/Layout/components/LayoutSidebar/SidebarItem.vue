<template>
  <div class="menu-wrapper">
    <div class="logo">
      <icon class="icon" name="shanghai-disney-resort"></icon>
      <span class="title">Disney Resort</span>
    </div>
    <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <router-link v-if="item.children.length===1 && !item.children[0].children && !item.alwaysShow" :to="item.path+'/'+item.children[0].path" :key="item.children[0].name">
        <el-menu-item :index="item.path+'/'+item.children[0].path" :class="{'submenu-title-noDropdown':!isNest}">
          <icon v-if="item.children[0].meta&&item.children[0].meta.icon" :name="item.children[0].meta.icon"></icon>
          <span v-if="item.children[0].meta&&item.children[0].meta.title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <icon v-if="item.meta&&item.meta.icon" :name="item.meta.icon"></icon>
          <span v-if="item.meta&&item.meta.title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path"></sidebar-item>
          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path">
              <icon v-if="child.meta&&child.meta.icon" :name="child.meta.icon"></icon>
              <span v-if="child.meta&&child.meta.title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus">
.menu-wrapper
  .icon--pep
    font-size: 14px;
    display: inline-block;
</style>
