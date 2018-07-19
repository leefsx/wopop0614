<?php
if (!defined('IN_CONTEXT')) die('access violation error!');

class wp_wxwidgets extends Module
{	
    public function save_layout(){
		// for 'permission'
		if (! ACL::isAdminActionHasPermission('frontpage', 'save')) {
			exit(Toolkit::jsonERR('No Permission'));
		}
		
        $page_id =& ParamHolder::get('id');
        $mod_info_json=& ParamHolder::get('mods');
        $mods=  json_decode(stripslashes($mod_info_json),true);
		$s_params =& ParamHolder::get('s_params', '');
		$rmids =& ParamHolder::get('rmids', array());
		// Update 'wxmenu.s_params'
		if (!is_numeric($page_id)) exit(Toolkit::jsonERR());
		if (!empty($s_params)) {
			$s_params = stripslashes($s_params);
			$this->db->update("wxmenu", array('s_params'=>$s_params), "`id` = '{$page_id}'");
		}
		
		$values = "";
		$slice = 20;// 批量写表基数
		$form_plugins = array();// 表单组件
		$prefix = Config::$tbl_prefix;
		$_sql = "REPLACE INTO `{$prefix}wxmodule_blocks` ";
        foreach($mods as $i => $mod){
			if(empty($mod['id'])||empty($mod['type'])){continue;}
			// for '表单组件'
			$mtype = $mod['type'];
			if (preg_match('/^form(?!_submit)/i', $mtype)) {
				$layerid = $mod['id'];
				$parentid = $mod['parent'];
				if (preg_match('/^layer\w+$/i', $parentid)) {
					$ischild = true;
					$idx = $parentid;
				} else if ($mtype == 'form') {
					$ischild = false;
					$idx = $layerid;
				}
				
				$tmparr = $form_plugins[$idx];
				if (empty($tmparr)) {
					$tmparr = array();
					$tmparr['children'] = array();
				}
				if ($ischild) {
					array_push($tmparr['children'], array(
						'id' => $layerid,'type' => $mtype
					));
				} else $tmparr['tbl'] = $mod['childprop']['tbl'];
				$form_plugins[$idx] = $tmparr;
			}
			
			$fields_alias = array('id'=>'id',
				'father_id'=>'parent', 'plugin_name'=>'type',
				'html'=>'childprop');
			
			$fields = "`pid`,";
			$values .= "('".mysql_real_escape_string($page_id)."',";
			foreach ($fields_alias as $k => $v) {
				$fields .= "`{$k}`,";
				$val = $mod[$v];
				if (is_array($val)) $val = json_encode($val);
				$values .= "'".mysql_real_escape_string($val)."',";
				unset($mod[$v]);
			}
			$fields .= "`css`";
			$values .= "'".json_encode($mod)."'),";
			
			if (($i + 1) % $slice == 0) {
				$sql = $_sql . "({$fields}) VALUES";
				$this->db->customSql($sql.rtrim($values, ","));
				$values = "";
			}
        }
		if (!empty($values)) {
			$sql = $_sql . "({$fields}) VALUES";
			$this->db->customSql($sql.rtrim($values, ","));
		}
		// 移除'已删除模块'记录
		if (is_array($rmids) && !empty($rmids)) {
			$rmids_list = "";
			foreach ($rmids as $rmid) {
				$rmids_list .= "'{$rmid}',";
				// for '表单数据'表
				$this->dropcol_wxform_table($rmid);
			}
			$rmids_list = rtrim($rmids_list, ",");
			$where = "`pid` = '{$page_id}' AND (`id` IN({$rmids_list}) OR `father_id` IN({$rmids_list}))";
			$this->db->remove('wxmodule_blocks', $where);
			// 暂不获取“页面/插件名称”
			Toolkit::writeLogop('删除页面('.$page_id.')中的“'.$rmids_list.'”插件', 3004);
		}
		// for '表单组件'
		$this->alter_wxform_table($form_plugins);

		exit(Toolkit::jsonOK());
    }
    
	public function remove_module(){
		$pageid =& ParamHolder::get('pageid', '');
		$del_ids =& ParamHolder::get('del_ids', '');
		$pagename =& ParamHolder::get('pagename', '');
		$del_types =& ParamHolder::get('del_types', '');
		
		if (!is_numeric($pageid) || empty($del_ids))
			exit(Toolkit::jsonERR('非法请求'));
		
		$ids = "";
		$del_idsarr = explode(",", $del_ids);
		foreach ($del_idsarr as $layerid) {
			if (preg_match('/^layer[a-z0-9]+$/i', $layerid))
				$ids .= "'".$layerid."',";
		}
		if (!empty($ids)) $this->db->remove("wxmodule_blocks", "(`id` IN(".rtrim($ids, ",").") OR `father_id` IN(".rtrim($ids, ",").")) AND `pid` = '{$pageid}'");
		
		Toolkit::writeLogop('删除页面“'.$pagename.'”中的“'.rtrim($del_types, ',').'”插件', 3004);
		exit(Toolkit::jsonOK());
	}
	
    public function gen_wxapp(){
            set_time_limit(0);
            ini_set('memory_limit','1024M');
			$manage_inf=Toolkit::getManageInf();
            $dirname=$manage_inf['name'].time();
			if(file_exists(ROOT.'/upload/'.$dirname)){
                die('Error');
            }
            session_write_close();
            
            $app_dir=ROOT.'/upload/'.$dirname;
            FileUtils::copy(ROOT."/template/weapp/wxapp",$app_dir);
            $this->set_gen_app_progress(0.1);
            
			$pages = $this->db->findAll('wxmenu',array('id','name','i_order','ishome','s_params'),"plate_id <> -1",'order by i_order asc');
			$modules = $this->db->findAll('wxmodule_blocks',array('id','plugin_name','html','css','pid','father_id'),'','order by pid asc');
			$mod_arr = $plugins = $pnames = array();
			$akey = 'ALL_PAGE_CUSTOMER_SERVICE';
			$adata = Toolkit::getParameters($akey);
			$all_page_customer_service = '2';
			$customer_service_arr = array();
			if (!empty($adata)) {
				if($adata[$akey]=='1'){
					foreach($modules as $mval){
						if(empty($mval['plugin_name'])||empty($mval['id'])){continue;}
						if($mval['plugin_name']=='customer_service'){
							$css = json_decode($mval['css'],true);
							$html = array('childprop'=>json_decode($mval['html'],true));
							$mval['type'] = $mval['plugin_name'];
							unset($mval['css']);unset($mval['html']);unset($mval['plugin_name']);
							$customer_service_arr = array_merge($mval,$css,$html);
							$all_page_customer_service = '1';
						}
					}
				}
			}
			if($pages && $modules){
                    $freelayoutsid=array();
                    foreach($modules as $key=>$val){
                        $freelayoutsid[$val['id']]=true;
                    }
                    $usefulmodules=array();
                    foreach($modules as $key=>$val){
                        if(!empty($val['father_id']) && !$freelayoutsid[$val['father_id']]){
                            continue;
                        }
                        $usefulmodules[]=$val;
                    }
                    $modules=$usefulmodules;
				foreach($modules as $key=>$val){
					if(empty($val['plugin_name'])||empty($val['id'])){continue;}
					$css = json_decode($val['css'],true);
					$html = array('childprop'=>json_decode($val['html'],true));
					$val['type'] = $val['plugin_name'];
					
					unset($val['css']);unset($val['html']);unset($val['plugin_name']);
					$newarr = array_merge($val,$css,$html);
					
					$mod_arr[$val['pid']][] = $newarr;
					$plugins_total[] = $val['type'];
				}
				//页面中用到的插件 排除freelayout
				$plugins = array_unique($plugins_total);
				foreach($plugins as $key=>$val){
					if(in_array($val, array('freelayout','form'))){
						unset($plugins[$key]);
						continue;
					}
					$this->copy_weapp_plugin($val, $app_dir);
				}
                    $this->set_gen_app_progress(0.3);
				$defapage = array();
				foreach($pages as $k=>$v){
					$str = '';$modarr = array();
					if($mod_arr[$v['id']]){
						$modarr = $mod_arr[$v['id']];
						usort($modarr,array(&$this,'mod_sort'));
					}else continue;//空数据页面略过
					$pagetpl=new Wetpl('page');
					$pagetpl->assign('mods',$modarr);
					$pagetpl->assign('pageid',$v['id']);
					$pagetpl->assign('all_page_customer_service', $all_page_customer_service);
					$pagetpl->assign('customer_service_arr', $customer_service_arr);
					// 页面背景
					$bgarr = json_decode($v['s_params'], true);
					if (is_array($bgarr) && !empty($bgarr)) {
						$pagebg = '';
						foreach ($bgarr as $bk => $bv) {
							if (empty($bv)) continue;
							if ($bk == 'background-image'
								&& $bv != 'none') $bv = 'url('.$bv.')';
							$pagebg .= $bk.':'.$bv.';';
						}
						$pagetpl->assign('pagebg', $pagebg);
					}
					$content=$pagetpl->render(); 
					// for 'all_page_customer_service'
					$pagename = 'page'.$v['id'];//页面命名 page+id
					if($v['ishome']==1) $defapage = array($pagename);
					else $pnames[] = $pagename;
					$con_arr = explode('#$%^&&^%$#',$content);
					FileUtils::createDir($app_dir."/pages/$pagename");
					//wxml wxss js 生成
					file_put_contents($app_dir."/pages/$pagename/$pagename.wxml",$con_arr[0]);
					file_put_contents($app_dir."/pages/$pagename/$pagename.wxss",$con_arr[1]);
					file_put_contents($app_dir."/pages/$pagename/$pagename.js",$con_arr[2]);
				}
			}
               $this->set_gen_app_progress(0.8);
			//app.json 生成
			$pagetpl=new Wetpl('json');
			//营销版页面
			$tbpage = array('ucenter','shopping_cart','login','address','address-list','orders','order_detail','order_confirm','view-logistics','coupon','ratings','showsuccess','search-page','appoint_order','appoint_comments','appiont_order_detail','appiont_order_list');
			if(empty($defapage)) $defapage = array();
			$data = array_merge($defapage,$pnames,$tbpage);
			$pagetpl->assign('pnames',$data);
			
			$insidepage_themes = array();
			// for 'navbar-styles'
			$navbarky = 'WXAPP_NAVBARSTYLES';
			$navbarstyles = Toolkit::getParameters($navbarky);
			if (!empty($navbarstyles)) {
				$navigationBar = '';
				$navbar_arr = json_decode($navbarstyles[$navbarky], true);
				foreach ($navbar_arr as $ky => $val) {
					if (preg_match('/^navigationBar+/', $ky)) {
						$navigationBar .= '"'.$ky.'":"'.$val.'",';
					} else $insidepage_themes[$ky] = $val;
				}
				$pagetpl->assign('navigationBar', rtrim($navigationBar, ","));
			}
			$content=$pagetpl->render();
			file_put_contents($app_dir."/app.json",$content);
			
			//app.wxss 生成
			if($navbar_arr['insidepage_themecolor']){
				$pagetpl=new Wetpl('wxss');
				$pagetpl->assign('insidepage_themecolor', $navbar_arr['insidepage_themecolor']);
				$content=$pagetpl->render();
				file_put_contents($app_dir."/app.wxss",$content);
			}
			
			// static/config.js 生成
			$pky = 'WXAPP_CONFIG';$configarr = array();
			$wxconfig = Toolkit::getParameters($pky, true);
			if (!empty($wxconfig)) $configarr = json_decode($wxconfig[$pky], true);
			if (!empty($insidepage_themes)) $configarr = array_merge($configarr, $insidepage_themes);
			// for 'bottom-navbar'
			$pky2 = 'WXAPP_BTMNAV';$tabarr = array();
			$btmnav_params = Toolkit::getParameters($pky2);
			if (!empty($btmnav_params)) {
				$tabbars = $btmnav_params[$pky2];
				$tabarr = json_decode($tabbars, true);
				if ($tabarr['isopen'] == true) {
					unset($tabarr['isopen']);
					$tablist = $tabarr['list'];
					if (is_array($tablist) && !empty($tablist)) {
						foreach ($tablist as $t => $tab) {
							$pagePath = $tab['pagePath'];
							if (is_numeric($pagePath)) $pagePath = 'page'.$pagePath;
							$tablist[$t]['pagePath'] = $pagePath.'/'.$pagePath;
							$tablist[$t]["text"] = urlencode($tab["text"]);
							/* $iconPath = $this->download_tabicon($tab['iconPath']);
							if (!empty($iconPath)) $tablist[$t]["iconPath"] = $iconPath;
							else unset($tablist[$t]["iconPath"]);
							$selectedIconPath = $this->download_tabicon($tab['selectedIconPath']);
							if (!empty($iconPath)) $tablist[$t]["selectedIconPath"] = $selectedIconPath;
							else unset($tablist[$t]["selectedIconPath"]); */
						}
						$tabarr['list'] = $tablist;
					}
					$tabarr = array('tabBar' => $tabarr);
				} else $tabarr = array();
			}
			$static_configs = array_merge_recursive($configarr, $tabarr);
			if (!empty($static_configs)) {
				$content = urldecode(json_encode($static_configs));
				$content = "module.exports = ".stripslashes($content);
				file_put_contents($app_dir."/static/config.js", $content);
			}
            if($configarr['appid']){
                $pagetpl = new Wetpl('projectconfig');
                $pagetpl->assign('appid',$configarr['appid']);
                $content=$pagetpl->render();
				file_put_contents($app_dir."/project.config.json",$content);
            }
		 $this->set_gen_app_progress(0.9);	
            FileUtils::zipDir($app_dir);
            FileUtils::rmDir($app_dir);
            $localfile = $app_dir.".zip";
            if (!file_exists($localfile)) {
                return false;
            }
            $this->set_gen_app_progress(0.99);	
            $ret=$this->upload_wxapp($localfile);
            unlink($localfile);
            $this->set_gen_app_progress(1);
            if(!$ret) return false;
            return true;
    }
    
    private function upload_wxapp($file){
          ob_start();
		$response = '';
		$result = array();

		require_once P_LIB."/http.class.php";
		$http = new Http();
		$data = array('author' => Config::$name);
           // 获取服务器端返回信息
          $manage_inf = Toolkit::getManageInf();
          $pichost=$manage_inf['pichost'];
          $uploadurl="https://".$pichost."/picserver/wxapp.php";
		$http->upload($uploadurl, "http://www.wopop.com/", $data, array($file));
		$response .= ob_get_contents();
		ob_end_clean();
          $resarr=  json_decode($response, true);
          if(!empty($resarr) && !empty($resarr['status'])){
              return true;
          }
          return false;
    }
    
    public function download_wxapp(){
           set_time_limit(0);
           $manage_inf=Toolkit::getManageInf();
          $localfile=ROOT.'/upload/'.$manage_inf['name'].'_d'.time().'.zip';
           //$url='http://'.$manage_inf['pichost'].'/upload/miniapp/'.$manage_inf['name'].'_wxapp.zip';
		   $url='https://'.$manage_inf['pichost'].'/picserver/upload/lishifeng2/miniapp/'.$manage_inf['name'].'_wxapp.zip';
           
           $curl = curl_init();
           curl_setopt($curl,CURLOPT_URL,$url);
           curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
           $output = curl_exec($curl);
           if(curl_getinfo($curl,CURLINFO_HTTP_CODE)=='200'){
               file_put_contents($localfile, $output);
           }else{
               die('Error');
           }
		 curl_close($curl);
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename=app.zip');
            header('Content-Transfer-Encoding: binary');
            header('Content-Length: ' . filesize($localfile));
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            $ua = $_SERVER['HTTP_USER_AGENT'];
            $is360e = preg_match('/MSIE/i', $ua) && preg_match('/Trident/i', $ua);
            if (readfile($localfile) !== false && ! $is360e){
                unlink($localfile);
            } 
    }
    
	private function download_tabicon($fileurl){
		$icndir = realpath(P_TPL.'/../weapp/wxapp/static/tabicon');
		if (! file_exists($icndir) || empty($fileurl)) return "";
		$basename = strrchr($fileurl, '/');
		$icndir .= $basename;

		$wf = @fopen($icndir, 'w');
		if (! $wf) return "";
		if (function_exists('curl_init')) {
			$ch = curl_init($fileurl);
			curl_setopt($ch, CURLOPT_TIMEOUT, 180);
			curl_setopt($ch, CURLOPT_FILE, $wf);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
			$downloadresult = curl_exec($ch);
			if ($downloadresult) {
				$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);  
				if ($statusCode != 200) $downloadresult = FALSE;
			}
			curl_close($ch);
		} else {
			$rf = @fopen($fileurl, 'rb');
			if (! $rf) {fclose($wf);return "";}
			$bytes = stream_copy_to_stream($rf, $wf);
			if (! $bytes) $downloadresult = FALSE;
			fclose($rf);
		}
		fclose($wf);
		
		if ($downloadresult === FALSE) return "";
		return 'static/tabicon' . $basename;
	}
	
    private function copy_weapp_plugin($type,$appdir){
        $fromdir=ROOT."/wxplugin/{$type}/wx";
        $todir=$appdir."/plugins/{$type}";
        FileUtils::copy($fromdir,$todir);
    }
    
    private function set_gen_app_progress($num){
            $num=floatval($num);
            $ret=$this->db->findAll('object_cache', array('content'), " query='gen_miniapp_progress' ");
            if(empty($ret)){
                $expired=  date("Y-m-d H:i:s");
                $this->db->insert('object_cache', array('query'=>'gen_miniapp_progress','content'=>$num,'expired'=>$expired));
            }else{
                $this->db->update('object_cache', array('content'=>$num), " query='gen_miniapp_progress' ");
            }
            
    }
	
	private function mod_sort($a,$b){
		if ($a['zindex']==$b['zindex']) return 0;
		return ($a['zindex']<$b['zindex'])?-1:1;
	}
      
    public function check_app_progress(){
        $ret=$this->db->findAll('object_cache', array('content','expired'), " query='gen_miniapp_progress' ");
        $nowtime=time();
        if(empty($ret)){
            echo json_encode(array('status'=>1,'percent'=>0));
            exit();
        }else{
            $percent=floatval($ret[0]['content']);
            if($percent>=1){
                $this->db->remove('object_cache', " query='gen_miniapp_progress' ");
                echo json_encode(array('status'=>2,'percent'=>1));
                exit();
            }else{
                echo json_encode(array('status'=>1,'percent'=>$percent));
                exit();
            }
        }
    }
  
     /**
	 * 小程序API配置
	 */
	public function wxapp_configset(){
		$configs = array();
		$kystr = 'WXAPP_CONFIG';
		$type =& ParamHolder::get('type', '');
		if ($type == 'update') {
			$frmdata =& ParamHolder::get('frmdata', array());
			if (is_array($frmdata) && !empty($frmdata)) {
				$jsndata = json_encode($frmdata);
				Toolkit::updateParameters(array($kystr => $jsndata));
				if($frmdata['mch_id']||$frmdata['wxpaykey']){
					$cashresult = $this->db->findAll("payment",array(),"  s_locale='{$this->curr_locale}' and `key`=18 ");
					if(!$cashresult){
						$wxconfig = Toolkit::getParameters($kystr);
						$paraStr = '';
						if($wxconfig[$kystr]){
							$paraArr = json_decode($wxconfig[$kystr],true);
							$paraStr = serialize($paraArr);
						}
						$title=__('Weixin title',$this->curr_locale).'('.__('Miniprogram',$this->curr_locale).')'; 
						$new_id = $this->db->insert('payment',array('s_id' => '0','title' => $title,'key' => '18','i_order' =>18,'description' => '','enable' => '1','s_locale' => $this->curr_locale,'paraval' => $paraStr),true);
					}else{
						$fee_arr = unserialize($cashresult[0]['paraval']);
						$fee_arr['mch_id']=$frmdata['mch_id'];
						$fee_arr['wxpaykey']=$frmdata['wxpaykey'];
						$this->db->update('payment',array('paraval' => serialize($fee_arr)),"id=".$cashresult[0]['id']);
					}
					
				}
			}
              $this->gen_wxapp();
			exit('{}');
		} else {
			$configs = Toolkit::getParameters($kystr);
			// Get the bound domains
			$domainres = $this->getDomains();
			
			$jsnres = '{"domains":'.(!empty($domainres)?json_encode($domainres):"{}");
			$jsnres .= ',"configs":'.(!empty($configs)?$configs[$kystr]:"{}").'}';
			echo $jsnres;
		}
	}
    
	private function getDomains(){
		$manageinf = Toolkit::getManageInf();
		$test_domain = Toolkit::getPreviewUrl();
		$where = "`manageid` = '" . $manageinf['id'] . "'";
		$where .= " ";
		$sql = "SELECT `domain` FROM `wp_domain` WHERE " . $where;
		$domains = Mysql::manageDBQuery($sql);
		if (!is_array($domains)) $domains = array();
          $mydashboardurl=array('www.websitemanage.cn','www.sitestarcenter.cn');
          $test_domain='.isitestar.cn';
          if($manageinf['is_agent']=='1' || !in_array($manageinf['manage_domain'],$mydashboardurl)){
              $test_domain='.isitecenter.cn';
          }
		$domainres = array();
		foreach ($domains as $val) {
			$domain = $val['domain'];
//			if (Toolkit::is_test_domain($domain)) continue;
               if (strpos($domain,'.isitestar.cn')!==false || strpos($domain,'.isitecenter.cn')!==false|| strpos($domain,'.isitecenter.com')!==false || strpos($domain,'.isitestar.com')!==false) continue;
			$domainres['https://' . $domain] = $domain;
		}
          if(!Toolkit::isWebsiteForeign()){
              $domain = $manageinf['username'].$test_domain;
              $domainres['https://' . $domain] = $domain;
          }
		return $domainres;
	}
	
	private function get_wxformtbl_fields($table){
		$columns = array();
		$rows = $this->db->customSql("SHOW COLUMNS FROM `{$table}`");
		if (is_array($rows) && !empty($rows))
			foreach ($rows as $row) $columns[] = $row['Field'];
		
		return $columns;
	}
	
	private function check_wxform_exist($table){
		$row = $this->db->customSql("SHOW TABLES LIKE '{$table}'");
		return (is_array($row) && !empty($row)) ? true : false;
	}
	
	private function wxform_fieldtype($type){
		$typarr = array(
			'form_input' => 'VARCHAR(255)',
			'form_options' => 'VARCHAR(255)',
			'form_selector' => 'VARCHAR(255)',
			'form_textarea' => 'TEXT'
		);
		return array_key_exists($type, $typarr) ? $typarr[$type] : 'VARCHAR(255)';
	}
	
	private function dropcol_wxform_table($layerid){
		$prefix = Config::$tbl_prefix;
		$where = "`id` = '{$layerid}' AND `plugin_name` LIKE 'form%'";
		$rows = $this->db->findAll('wxmodule_blocks', array('html','father_id'), $where);
		if (is_array($rows) && !empty($rows)) {
			$father_id = $rows[0]['father_id'];
			if (preg_match('/^layer/i', $father_id)) {
				// 删除“表单子组件”
				$kwhere = "`id` = '{$father_id}' AND `plugin_name` = 'form'";
				$krows = $this->db->findAll('wxmodule_blocks', array('html'), $kwhere);
				if (is_array($krows) && !empty($krows)) {
					$htmarr = json_decode($krows[0]['html'], true);
					$tblname = $prefix . $htmarr['tbl'];
					if ($this->check_wxform_exist($tblname)) {
						$column = substr($layerid, 5);
						$columns = $this->get_wxformtbl_fields($tblname);
						if (in_array($column, $columns)) $sql = "ALTER TABLE `{$tblname}` DROP `{$column}`";
					}
				}
			} else {
				// 删除“表单”
				$htmarr = json_decode($rows[0]['html'], true);
				$tblname = $htmarr['tbl'];
				if (!empty($tblname)) {
					// 若“存在表记录”，则不删除
					$tmpsql = "SELECT COUNT(`id`) AS `sum` FROM `".$prefix.$tblname."`";
					$tmparr = $this->db->customSql($tmpsql);
					if (! intval($tmparr[0]['sum'])) $sql = "DROP TABLE IF EXISTS `".$prefix.$tblname."`";
				}
			}
			
			if (!empty($sql)) $this->db->customSql($sql);
		}
	}
	
	private function alter_wxform_table($params = array()){
		$prefix = Config::$tbl_prefix;
		if (!is_array($params)) $params = array();
		foreach ($params as $param) {
			$tblname = $prefix . $param['tbl'];
			if ($prefix == trim($tblname)) continue;
			if ($this->check_wxform_exist($tblname)) {
				// 编辑表字段
				$columns = $this->get_wxformtbl_fields($tblname);
				foreach ($param['children'] as $child) {
					$fieldky = substr($child['id'], 5);
					if (in_array($fieldky, $columns)) continue;
					$sql = "ALTER TABLE `{$tblname}` ADD `{$fieldky}` ";
					$sql .= $this->wxform_fieldtype($child['type'])." NOT NULL DEFAULT ''";
					$this->db->customSql($sql);
				}
			} else {
				// 创建新表
				$fields = "";
				foreach ($param['children'] as $child) {
					$fields .= "`".substr($child['id'], 5)."` ";
					$fields .= $this->wxform_fieldtype($child['type'])." NOT NULL DEFAULT '',";
				}
				if (!empty($fields)) {
					$sql = "CREATE TABLE IF NOT EXISTS `{$tblname}` (
						`id` INT(11) NOT NULL AUTO_INCREMENT,
						`submited_time` INT(10) NOT NULL COMMENT '提交时间',
						{$fields} PRIMARY KEY (`id`)
					) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;";
					$this->db->customSql($sql);
				}
			}
		}
	}
}
