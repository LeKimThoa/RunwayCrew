import { Component, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { AchievementService } from 'src/app/services/achievement.service';
import { ContributionService } from 'src/app/services/contribution.service';
import { ProfileService } from 'src/app/services/profile.service';
import { SkillService } from 'src/app/services/skill.service';
import { FileUploadComponent } from 'src/app/shared/file-upload/file-upload.component';
import { Achievement } from 'src/models/achievement.model';
import { Skill } from 'src/models/skill.model';
import { UserProfile } from 'src/models/user-profile.model';
@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit {

  constructor(
    private achievementService: AchievementService,
    private skillService: SkillService,
    private profileService: ProfileService,
    private contributionService: ContributionService,
    private dialog: NbDialogService) { }

  ngOnInit(): void {
    // this.loadPage();
    this.skillService.getAll().subscribe((skills) => {
      if (!skills) {
        return;
      }
      this.skills.length = 0;
      this.skills.push(...skills)
    });
    this.profileService.getAll().subscribe((profiles) => {
      this.profiles.length = 0;
      this.profiles.push(...profiles);
    });
    this.achievementService.getAll().subscribe((achievements) => {
      this.achievements.length = 0;
      this.achievements.push(...achievements);
    })
  }
  public page = 0;
  public size = 50;
  public achievements: Achievement[] = [];
  public skills: Skill[] = [];
  public selectedProvidingAchievement?: Achievement;
  public profiles: UserProfile[] = [];
  public selectedProvidedUser?: UserProfile;
  public skipAchievement: boolean = false;

  public addEmptyAchievement() {
    this.achievements.push({
      _id:'',
      id: Date.now().toString(),
      name: "",
      description: "",
      image: "",
      exp: 0,
      skills: [],
      credit: 0
    });
  }

  public uploadImage(i: number) {
    this.dialog.open(FileUploadComponent).onClose.subscribe((data) => {
      this.achievements[i].image = data.url;
    })
  }

  public async deleteAchievement(id: string) {
    await this.achievementService.delete(id);
    window.location.reload();
  }

  public async saveAchievement(i: number) {
    const _id = this.achievements[i]._id;
    if(!_id){
      await this.achievementService.create(this.achievements[i]);
    }else{
      await this.achievementService.update(this.achievements[i]);
    }
  }

  // public async loadPage() {
  //   let achievements = await this.achievementService.getPaginate(this.page * this.size, this.size);
  //   this.achievements.length = 0;
  //   this.achievements.push(...achievements.docs.map((d) => <Achievement>d.data()));
  // }

  public async addNewSkill(achievement: Achievement) {
    achievement.skills.push({
      skillId: "",
      exp: 0
    });
  }

  public getSkillById(id: string): Skill | undefined {
    return this.skills.find((s) => s.id == id);
  }

  public async provideAchievement() {
    if (!this.selectedProvidedUser || !this.selectedProvidingAchievement) {
      return;
    }
    try {
      await this.contributionService.provide(this.selectedProvidingAchievement, this.selectedProvidedUser?.uid, this.skipAchievement)
      this.selectedProvidedUser = undefined;
      this.selectedProvidingAchievement = undefined;
      this.skipAchievement = false;
    }
    catch (err) {
      console.log(err);
    }
  }

}
